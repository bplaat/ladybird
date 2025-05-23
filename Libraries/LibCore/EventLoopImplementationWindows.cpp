/*
 * Copyright (c) 2023, Andreas Kling <andreas@ladybird.org>
 * Copyright (c) 2024-2025, stasoid <stasoid@yahoo.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

#include <AK/HashMap.h>
#include <LibCore/EventLoopImplementationWindows.h>
#include <LibCore/Notifier.h>
#include <LibCore/ThreadEventQueue.h>
#include <LibCore/Timer.h>

#include <AK/Windows.h>

struct Handle {
    HANDLE handle = NULL;

    explicit Handle(HANDLE h = NULL)
        : handle(h)
    {
    }
    Handle(Handle&& h)
    {
        handle = h.handle;
        h.handle = NULL;
    }
    void operator=(Handle&& h)
    {
        VERIFY(!handle);
        handle = h.handle;
        h.handle = NULL;
    }
    ~Handle()
    {
        if (handle)
            CloseHandle(handle);
    }

    bool operator==(Handle const& h) const { return handle == h.handle; }
    bool operator==(HANDLE h) const { return handle == h; }
};

template<>
struct Traits<Handle> : DefaultTraits<Handle> {
    static unsigned hash(Handle const& h) { return Traits<HANDLE>::hash(h.handle); }
};
template<>
constexpr bool IsHashCompatible<HANDLE, Handle> = true;

namespace Core {

struct EventLoopTimer {
    WeakPtr<EventReceiver> owner;
    TimerShouldFireWhenNotVisible fire_when_not_visible = TimerShouldFireWhenNotVisible::No;
};

struct ThreadData {
    static ThreadData* the()
    {
        thread_local OwnPtr<ThreadData> thread_data = make<ThreadData>();
        if (thread_data)
            return &*thread_data;
        return nullptr;
    }

    ThreadData()
    {
        wake_event.handle = CreateEvent(NULL, FALSE, FALSE, NULL);
        VERIFY(wake_event.handle);
    }

    // Each thread has its own timers, notifiers and a wake event.
    HashMap<Handle, EventLoopTimer> timers;
    HashMap<Handle, Notifier*> notifiers;

    // The wake event is used to notify another event loop that someone has called wake().
    Handle wake_event;
};

EventLoopImplementationWindows::EventLoopImplementationWindows()
    : m_wake_event(ThreadData::the()->wake_event.handle)
{
}

int EventLoopImplementationWindows::exec()
{
    for (;;) {
        if (m_exit_requested)
            return m_exit_code;
        pump(PumpMode::WaitForEvents);
    }
    VERIFY_NOT_REACHED();
}

size_t EventLoopImplementationWindows::pump(PumpMode)
{
    auto& event_queue = ThreadEventQueue::current();
    auto* thread_data = ThreadData::the();
    auto& notifiers = thread_data->notifiers;
    auto& timers = thread_data->timers;

    size_t event_count = 1 + notifiers.size() + timers.size();
    // If 64 events limit proves to be insufficient RegisterWaitForSingleObject or other methods
    // can be used instead as mentioned in https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitformultipleobjects
    // TODO: investigate if event_count can realistically exceed 64
    VERIFY(event_count <= MAXIMUM_WAIT_OBJECTS);

    Vector<HANDLE, MAXIMUM_WAIT_OBJECTS> event_handles;
    event_handles.append(thread_data->wake_event.handle);

    for (auto& entry : notifiers)
        event_handles.append(entry.key.handle);
    for (auto& entry : timers)
        event_handles.append(entry.key.handle);

    bool has_pending_events = event_queue.has_pending_events();
    int timeout = has_pending_events ? 0 : INFINITE;
    DWORD result = WaitForMultipleObjects(event_count, event_handles.data(), FALSE, timeout);
    if (result == WAIT_TIMEOUT) {
        // FIXME: This verification sometimes fails with ERROR_INVALID_HANDLE, but when I check
        //        the handles they all seem to be valid.
        // VERIFY(GetLastError() == ERROR_SUCCESS || GetLastError() == ERROR_IO_PENDING);
    } else {
        size_t const index = result - WAIT_OBJECT_0;
        VERIFY(index < event_count);
        // : 1 - skip wake event
        for (size_t i = index ? index : 1; i < event_count; i++) {
            // i == index already checked by WaitForMultipleObjects
            if (i == index || WaitForSingleObject(event_handles[i], 0) == WAIT_OBJECT_0) {
                if (i <= notifiers.size()) {
                    Notifier* notifier = *notifiers.get(event_handles[i]);
                    event_queue.post_event(*notifier, make<NotifierActivationEvent>(notifier->fd(), notifier->type()));
                } else {
                    auto& timer = *timers.get(event_handles[i]);
                    if (auto strong_owner = timer.owner.strong_ref())
                        if (timer.fire_when_not_visible == TimerShouldFireWhenNotVisible::Yes || strong_owner->is_visible_for_timer_purposes())
                            event_queue.post_event(*strong_owner, make<TimerEvent>());
                }
            }
        }
    }

    return event_queue.process();
}

void EventLoopImplementationWindows::quit(int code)
{
    m_exit_requested = true;
    m_exit_code = code;
}

void EventLoopImplementationWindows::post_event(EventReceiver& receiver, NonnullOwnPtr<Event>&& event)
{
    m_thread_event_queue.post_event(receiver, move(event));
    if (&m_thread_event_queue != &ThreadEventQueue::current())
        wake();
}

void EventLoopImplementationWindows::wake()
{
    SetEvent(m_wake_event);
}

static int notifier_type_to_network_event(NotificationType type)
{
    switch (type) {
    case NotificationType::Read:
        return FD_READ | FD_CLOSE;
    case NotificationType::Write:
        return FD_WRITE;
    default:
        dbgln("This notification type is not implemented: {}", (int)type);
        VERIFY_NOT_REACHED();
    }
}

void EventLoopManagerWindows::register_notifier(Notifier& notifier)
{
    HANDLE event = CreateEvent(NULL, FALSE, FALSE, NULL);
    VERIFY(event);
    int rc = WSAEventSelect(notifier.fd(), event, notifier_type_to_network_event(notifier.type()));
    VERIFY(!rc);

    auto& notifiers = ThreadData::the()->notifiers;
    VERIFY(!notifiers.get(event).has_value());
    notifiers.set(Handle(event), &notifier);
}

void EventLoopManagerWindows::unregister_notifier(Notifier& notifier)
{
    // remove_first_matching would be clearer, but currently there is no such method in HashMap
    if (ThreadData::the())
        ThreadData::the()->notifiers.remove_all_matching([&](auto&, auto value) { return value == &notifier; });
}

intptr_t EventLoopManagerWindows::register_timer(EventReceiver& object, int milliseconds, bool should_reload, TimerShouldFireWhenNotVisible fire_when_not_visible)
{
    VERIFY(milliseconds >= 0);
    // FIXME: This is a temporary fix for issue #3641
    bool manual_reset = static_cast<Timer&>(object).is_single_shot();
    HANDLE timer = CreateWaitableTimer(NULL, manual_reset, NULL);
    VERIFY(timer);

    LARGE_INTEGER first_time = {};
    // Measured in 0.1μs intervals, negative means starting from now
    first_time.QuadPart = -10'000 * milliseconds;
    BOOL rc = SetWaitableTimer(timer, &first_time, should_reload ? milliseconds : 0, NULL, NULL, FALSE);
    VERIFY(rc);

    auto& timers = ThreadData::the()->timers;
    VERIFY(!timers.get(timer).has_value());
    timers.set(Handle(timer), { object, fire_when_not_visible });
    return reinterpret_cast<intptr_t>(timer);
}

void EventLoopManagerWindows::unregister_timer(intptr_t timer_id)
{
    if (ThreadData::the())
        ThreadData::the()->timers.remove(reinterpret_cast<HANDLE>(timer_id));
}

int EventLoopManagerWindows::register_signal([[maybe_unused]] int signal_number, [[maybe_unused]] Function<void(int)> handler)
{
    dbgln("Core::EventLoopManagerWindows::register_signal() is not implemented");
    VERIFY_NOT_REACHED();
}

void EventLoopManagerWindows::unregister_signal([[maybe_unused]] int handler_id)
{
    dbgln("Core::EventLoopManagerWindows::unregister_signal() is not implemented");
    VERIFY_NOT_REACHED();
}

void EventLoopManagerWindows::did_post_event()
{
}

NonnullOwnPtr<EventLoopImplementation> EventLoopManagerWindows::make_implementation()
{
    return make<EventLoopImplementationWindows>();
}

}
