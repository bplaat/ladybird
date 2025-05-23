// META: timeout=long
// META: script=/resources/WebIDLParser.js
// META: script=/resources/idlharness.js

// https://svgwg.org/svg2-draft/

'use strict';

let objects = {};

const elements = [
  'svg',
  'g',
  'defs',
  'desc',
  'title',
  'symbol',
  'use',
  'image',
  'switch',
  'style',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'textPath',
  'marker',
  'linearGradient',
  'radialGradient',
  'meshGradient',
  'stop',
  'pattern',
  'clipPath',
  'mask',
  'a',
  'view',
  'script',
  'animate',
  'set',
  'animateMotion',
  'mpath',
  'animateTransform',
  'metadata',
  'foreignObject',
  'filter',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feFuncR',
  'feFuncG',
  'feFuncB',
  'feFuncA',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'fePointLight',
  'feSpotLight',
  'feDisplacementMap',
  'feDropShadow',
  'feFlood',
  'feGaussianBlur',
  'feDisplacementMap',
  'feDropShadow',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
];

idl_test(
  ['SVG', 'svg-animations'],
  ['cssom', 'web-animations', 'html', 'dom'],
  idlArray => {
    const svgUrl = 'http://www.w3.org/2000/svg';
    for (const element of elements) {
      try {
        objects[element] = document.createElementNS(svgUrl, element);
      } catch (e) {
        // Will be surfaced by idlharess.js's test_object below.
      }
    }

    idlArray.add_untested_idls('interface CSSPseudoElement {};')
    idlArray.add_objects({
      SVGAnimatedBoolean: ['objects.feConvolveMatrix.preserveAlpha'],
      SVGAnimatedString: ['objects.a.target'],
      SVGStringList: ['objects.a.requiredExtensions'],
      SVGAnimatedEnumeration: ['objects.text.lengthAdjust'],
      SVGAnimatedInteger: ['objects.feConvolveMatrix.orderX'],
      SVGNumber: ['objects.svg.createSVGNumber()'],
      SVGAnimatedNumber: ['objects.stop.offset'],
      SVGNumberList: ['objects.text.rotate.baseVal'],
      SVGAnimatedNumberList: ['objects.text.rotate'],
      SVGLength: ['objects.svg.createSVGLength()'],
      SVGAnimatedLength: ['objects.svg.x'],
      SVGAnimatedLengthList: ['objects.text.x'],
      SVGAngle: ['objects.svg.createSVGAngle()'],
      SVGAnimatedAngle: ['objects.marker.orientAngle'],
      SVGRect: ['objects.svg.createSVGRect()'],
      SVGAnimatedRect: ['objects.svg.viewBox'],
      SVGSVGElement: ['objects.svg'],
      SVGGElement: ['objects.g'],
      SVGDefsElement: ['objects.defs'],
      SVGDescElement: ['objects.desc'],
      SVGTitleElement: ['objects.title'],
      SVGSymbolElement: ['objects.symbol'],
      SVGUseElement: ['objects.use'],
      SVGImageElement: ['objects.image'],
      SVGSwitchElement: ['objects.switch'],
      SVGStyleElement: ['objects.style'],
      SVGPoint: ['objects.svg.createSVGPoint()'],
      SVGPointList: ['objects.polygon.points'],
      SVGMatrix: ['objects.svg.createSVGMatrix()'],
      SVGTransform: ['objects.svg.createSVGTransform()'],
      SVGTransformList: ['objects.pattern.patternTransform.baseVal'],
      SVGAnimatedTransformList: ['objects.pattern.patternTransform'],
      SVGPreserveAspectRatio: ['objects.image.preserveAspectRatio.baseVal'],
      SVGAnimatedPreserveAspectRatio: ['objects.image.preserveAspectRatio'],
      SVGPathSegClosePath: ['objects.path.createSVGPathSegClosePath()'],
      SVGPathSegMovetoAbs: ['objects.path.createSVGPathSegMovetoAbs(0,0)'],
      SVGPathSegMovetoRel: ['objects.path.createSVGPathSegMovetoRel(0,0)'],
      SVGPathSegLinetoAbs: ['objects.path.createSVGPathSegLinetoAbs(0,0)'],
      SVGPathSegLinetoRel: ['objects.path.createSVGPathSegLinetoRel(0,0)'],
      SVGPathSegCurvetoCubicAbs: ['objects.path.createSVGPathSegCurvetoCubicAbs(0,0,0,0,0,0)'],
      SVGPathSegCurvetoCubicRel: ['objects.path.createSVGPathSegCurvetoCubicRel(0,0,0,0,0,0)'],
      SVGPathSegCurvetoQuadraticAbs: ['objects.path.createSVGPathSegCurvetoQuadraticAbs(0,0,0,0)'],
      SVGPathSegCurvetoQuadraticRel: ['objects.path.createSVGPathSegCurvetoQuadraticRel(0,0,0,0)'],
      SVGPathSegArcAbs: ['objects.path.createSVGPathSegArcAbs(0,0,0,0,0,true,true)'],
      SVGPathSegArcRel: ['objects.path.createSVGPathSegArcRel(0,0,0,0,0,true,true)'],
      SVGPathSegLinetoHorizontalAbs: ['objects.path.createSVGPathSegLinetoHorizontalAbs(0)'],
      SVGPathSegLinetoHorizontalRel: ['objects.path.createSVGPathSegLinetoHorizontalRel(0)'],
      SVGPathSegLinetoVerticalAbs: ['objects.path.createSVGPathSegLinetoVerticalAbs(0)'],
      SVGPathSegLinetoVerticalRel: ['objects.path.createSVGPathSegLinetoVerticalRel(0)'],
      SVGPathSegCurvetoCubicSmoothAbs: ['objects.path.createSVGPathSegCurvetoCubicSmoothAbs(0,0,0,0)'],
      SVGPathSegCurvetoCubicSmoothRel: ['objects.path.createSVGPathSegCurvetoCubicSmoothRel(0,0,0,0)'],
      SVGPathSegCurvetoQuadraticSmoothAbs: ['objects.path.createSVGPathSegCurvetoQuadraticSmoothAbs(0,0)'],
      SVGPathSegCurvetoQuadraticSmoothRel: ['objects.path.createSVGPathSegCurvetoQuadraticSmoothRel(0,0)'],
      SVGPathSegList: ['objects.path.pathSegList'],
      SVGPathElement: ['objects.path'],
      SVGRectElement: ['objects.rect'],
      SVGCircleElement: ['objects.circle'],
      SVGEllipseElement: ['objects.ellipse'],
      SVGLineElement: ['objects.line'],
      SVGPolylineElement: ['objects.polyline'],
      SVGPolygonElement: ['objects.polygon'],
      SVGTextElement: ['objects.text'],
      SVGTSpanElement: ['objects.tspan'],
      SVGTextPathElement: ['objects.textPath'],
      SVGMarkerElement: ['objects.marker'],
      SVGLinearGradientElement: ['objects.linearGradient'],
      SVGRadialGradientElement: ['objects.radialGradient'],
      SVGMeshGradientElement: ['objects.meshGradient'],
      SVGStopElement: ['objects.stop'],
      SVGPatternElement: ['objects.pattern'],
      SVGClipPathElement: ['objects.clipPath'],
      SVGMaskElement: ['objects.mask'],
      SVGAElement: ['objects.a'],
      SVGViewElement: ['objects.view'],
      SVGScriptElement: ['objects.script'],
      SVGAnimateElement: ['objects.animate'],
      SVGSetElement: ['objects.set'],
      SVGAnimateMotionElement: ['objects.animateMotion'],
      SVGMPathElement: ['objects.mpath'],
      SVGAnimateTransformElement: ['objects.animateTransform'],
      SVGMetadataElement: ['objects.metadata'],
      SVGForeignObjectElement: ['objects.foreignObject'],
      SVGFilterElement: ['objects.filter'],
      SVGFEBlendElement: ['objects.feBlend'],
      SVGFEColorMatrixElement: ['objects.feColorMatrix'],
      SVGFEComponentTransferElement: ['objects.feComponentTransfer'],
      SVGFEFuncRElement: ['objects.feFuncR'],
      SVGFEFuncGElement: ['objects.feFuncG'],
      SVGFEFuncBElement: ['objects.feFuncB'],
      SVGFEFuncAElement: ['objects.feFuncA'],
      SVGFECompositeElement: ['objects.feComposite'],
      SVGFEConvolveMatrixElement: ['objects.feConvolveMatrix'],
      SVGFEDiffuseLightingElement: ['objects.feDiffuseLighting'],
      SVGFEPointLightElement: ['objects.fePointLight'],
      SVGFESpotLightElement: ['objects.feSpotLight'],
      SVGFEDisplacementMapElement: ['objects.feDisplacementMap'],
      SVGFEDropShadowElement: ['objects.feDropShadow'],
      SVGFEFloodElement: ['objects.feFlood'],
      SVGFEGaussianBlurElement: ['objects.feGaussianBlur'],
      SVGFEImageElement: ['objects.feImage'],
      SVGFEMergeElement: ['objects.feMerge'],
      SVGFEMergeNodeElement: ['objects.feMergeNode'],
      SVGFEMorphologyElement: ['objects.feMorphology'],
      SVGFESpecularLightingElement: ['objects.feSpecularLighting'],
      SVGFETileElement: ['objects.feTile'],
      SVGFETurbulenceElement: ['objects.feTurbulence']
    });
  }
);
