// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file globalMocks.ts - Global mxGraph mocks for Node.js environment
 * @description Sets up the global mocks required by DrawioAPI when running
 * outside of a browser environment.
 */

declare global {
  var mxConstants: Record<string, string>;
  var mxUtils: {
    getXml: (node: unknown) => string;
    parseXml: (xml: string) => Document | null;
  };
  var mxCodec: new (document?: Document) => {
    document?: Document;
    encode: (model: unknown) => unknown;
    decode: (node: unknown) => unknown;
  };
  var mxPoint: new (
    x?: number,
    y?: number,
  ) => {
    x: number;
    y: number;
    clone: () => InstanceType<typeof mxPoint>;
  };
  var mxRectangle: new (
    x?: number,
    y?: number,
    width?: number,
    height?: number,
  ) => {
    x: number;
    y: number;
    width: number;
    height: number;
    clone: () => InstanceType<typeof mxRectangle>;
  };
  var mxGeometry: new (
    x?: number,
    y?: number,
    width?: number,
    height?: number,
  ) => {
    x: number;
    y: number;
    width: number;
    height: number;
    relative: boolean;
    points: unknown[] | null;
    offset: unknown | null;
    clone: () => InstanceType<typeof mxGeometry>;
  };
}

export function setupGlobalMocks(): void {
  globalThis.mxConstants = {
    STYLE_FILLCOLOR: "fillColor",
    STYLE_STROKECOLOR: "strokeColor",
    STYLE_STROKEWIDTH: "strokeWidth",
    STYLE_FONTCOLOR: "fontColor",
    STYLE_FONTSIZE: "fontSize",
    STYLE_FONTFAMILY: "fontFamily",
    STYLE_FONTSTYLE: "fontStyle",
    STYLE_SHAPE: "shape",
    STYLE_ROUNDED: "rounded",
    STYLE_DASHED: "dashed",
    STYLE_OPACITY: "opacity",
    STYLE_ALIGN: "align",
    STYLE_VERTICAL_ALIGN: "verticalAlign",
    STYLE_VERTICAL_LABEL_POSITION: "verticalLabelPosition",
    STYLE_LABEL_POSITION: "labelPosition",
    STYLE_SPACING: "spacing",
    STYLE_SPACING_TOP: "spacingTop",
    STYLE_SPACING_RIGHT: "spacingRight",
    STYLE_SPACING_BOTTOM: "spacingBottom",
    STYLE_SPACING_LEFT: "spacingLeft",
    STYLE_PERIMETER: "perimeter",
    STYLE_EDGE: "edgeStyle",
    STYLE_ENDARROW: "endArrow",
    STYLE_STARTARROW: "startArrow",
    STYLE_ENDFILL: "endFill",
    STYLE_STARTFILL: "startFill",
    STYLE_GRADIENT_DIRECTION: "gradientDirection",
    STYLE_GRADIENTCOLOR: "gradientColor",
    STYLE_ASPECT: "aspect",
    STYLE_IMAGE: "image",
    STYLE_IMAGE_WIDTH: "imageWidth",
    STYLE_IMAGE_HEIGHT: "imageHeight",
    STYLE_WHITE_SPACE: "whiteSpace",
  };

  globalThis.mxUtils = {
    getXml: function (_node: unknown): string {
      return "";
    },
    parseXml: function (_xml: string): Document | null {
      return null;
    },
  };

  globalThis.mxCodec = class {
    document?: Document;
    constructor(document?: Document) {
      this.document = document;
    }
    encode(model: unknown): unknown {
      return { model, type: "mxGraphModel" };
    }
    decode(_node: unknown): unknown {
      return null;
    }
  };

  globalThis.mxPoint = class {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    clone(): InstanceType<typeof mxPoint> {
      return new mxPoint(this.x, this.y);
    }
  };

  globalThis.mxRectangle = class {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    clone(): InstanceType<typeof mxRectangle> {
      return new mxRectangle(this.x, this.y, this.width, this.height);
    }
  };

  globalThis.mxGeometry = class {
    x: number;
    y: number;
    width: number;
    height: number;
    relative: boolean = false;
    points: unknown[] | null = null;
    offset: unknown | null = null;
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    clone(): InstanceType<typeof mxGeometry> {
      const geo = new mxGeometry(this.x, this.y, this.width, this.height);
      geo.relative = this.relative;
      geo.points = this.points ? [...this.points] : null;
      geo.offset = this.offset;
      return geo;
    }
  };
}

// Auto-setup when module is imported
setupGlobalMocks();
