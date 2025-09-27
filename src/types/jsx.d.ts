/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // HTML elements
      [elemName: string]: any;
      
      // SVG elements with their specific attributes
      svg: React.SVGAttributes<SVGSVGElement> & React.ClassAttributes<SVGSVGElement>;
      path: React.SVGAttributes<SVGPathElement> & React.ClassAttributes<SVGPathElement>;
      circle: React.SVGAttributes<SVGCircleElement> & React.ClassAttributes<SVGCircleElement>;
      rect: React.SVGAttributes<SVGRectElement> & React.ClassAttributes<SVGRectElement>;
      text: React.SVGAttributes<SVGTextElement> & React.ClassAttributes<SVGTextElement>;
      g: React.SVGAttributes<SVGGElement> & React.ClassAttributes<SVGGElement>;
      defs: React.SVGAttributes<SVGDefsElement> & React.ClassAttributes<SVGDefsElement>;
      pattern: React.SVGAttributes<SVGPatternElement> & React.ClassAttributes<SVGPatternElement>;
      mask: React.SVGAttributes<SVGMaskElement> & React.ClassAttributes<SVGMaskElement>;
    }
  }
}

export {}
