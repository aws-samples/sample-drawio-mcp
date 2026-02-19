// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file IOManager.ts - Import/Export operations
 * @description Manages diagram serialization using XML format (native draw.io format)
 */

import type { DrawioAPI } from "./DrawioAPI.js";
import type {
  APIResult,
  SvgExportOptions,
  PngExportOptions,
  XmlValidationResult,
} from "./types.js";

// Declare global mxGraph types
declare const mxCodec: new () => { encode: (model: unknown) => unknown };
declare const mxUtils: {
  getXml: (node: unknown) => string;
  parseXml: (xml: string) => Document;
  createXmlDocument: () => Document;
};
declare const mxGraphMlCodec:
  | (new () => { decode: (doc: Document, graph: unknown) => void })
  | undefined;

interface ModelInternal {
  beginUpdate(): void;
  endUpdate(): void;
}

interface GraphInternal {
  getSvg?: (background: string | null, border: number) => SVGElement;
  getGraphBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  exportPng?: (background: string | null, scale: number) => string;
}

interface EditorUiInternal {
  getImageDataUri?: (
    format: unknown,
    callback: (dataUri: string | null) => void,
    background: string | null,
    scale: number,
  ) => void;
  getFileData?: (compressed: boolean) => string;
  setFileData?: (data: string) => void;
}

export class IOManager {
  private _api: DrawioAPI;

  constructor(api: DrawioAPI) {
    this._api = api;
  }

  toXml(): APIResult<string> {
    try {
      const model = this._api.model;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const encoder = new mxCodec();
      const node = encoder.encode(model);
      const xml = mxUtils.getXml(node);

      return { success: true, data: xml };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  fromXml(xml: string): APIResult {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      if (!xml || typeof xml !== "string") {
        return { success: false, error: "Invalid XML input" };
      }

      const doc = mxUtils.parseXml(xml);

      const parseError = doc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        return { success: false, error: "XML parsing error" };
      }

      const codec = new (mxCodec as unknown as new (doc: Document) => {
        decode: (el: Element, model: unknown) => void;
      })(doc);

      model.beginUpdate();
      try {
        codec.decode(doc.documentElement, model);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  exportSvg(options: SvgExportOptions = {}): APIResult<string> {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const border = options.border || 0;
      const background = options.background || null;

      if (typeof graph.getSvg === "function") {
        const svg = graph.getSvg(background, border);
        if (svg) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svg);
          return { success: true, data: svgString };
        }
      }

      const bounds = graph.getGraphBounds();
      if (!bounds) {
        return { success: false, error: "No content to export" };
      }

      const svgDoc = mxUtils.createXmlDocument();
      const root = svgDoc.createElementNS("http://www.w3.org/2000/svg", "svg");
      root.setAttribute("width", String(bounds.width + border * 2));
      root.setAttribute("height", String(bounds.height + border * 2));
      root.setAttribute(
        "viewBox",
        `${bounds.x - border} ${bounds.y - border} ${bounds.width + border * 2} ${bounds.height + border * 2}`,
      );
      svgDoc.appendChild(root);

      const serializer = new XMLSerializer();
      return { success: true, data: serializer.serializeToString(svgDoc) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  exportPng(
    options: PngExportOptions = {},
  ): APIResult<string> | Promise<APIResult<string>> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const ui = this._api.editorUi as EditorUiInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const scale = options.scale || 1;
      const background = options.background || null;

      if (ui && typeof ui.getImageDataUri === "function") {
        const getImageDataUri = ui.getImageDataUri;
        return new Promise((resolve) => {
          getImageDataUri(
            null,
            (dataUri) => {
              if (dataUri) {
                resolve({ success: true, data: dataUri });
              } else {
                resolve({ success: false, error: "PNG export failed" });
              }
            },
            background,
            scale,
          );
        });
      }

      if (typeof graph.exportPng === "function") {
        const dataUrl = graph.exportPng(background, scale);
        if (dataUrl) {
          return { success: true, data: dataUrl };
        }
      }

      return {
        success: false,
        error: "PNG export not available in this environment",
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  importGraphML(xml: string): APIResult {
    try {
      const graph = this._api.graph;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      if (!xml || typeof xml !== "string") {
        return { success: false, error: "Invalid GraphML input" };
      }

      if (typeof mxGraphMlCodec !== "undefined" && mxGraphMlCodec) {
        const doc = mxUtils.parseXml(xml);
        const codec = new mxGraphMlCodec();

        model.beginUpdate();
        try {
          codec.decode(doc, graph);
        } finally {
          model.endUpdate();
        }

        return { success: true };
      }

      return { success: false, error: "GraphML import not available" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  toCompressedXml(): APIResult<string> {
    try {
      const ui = this._api.editorUi as EditorUiInternal | null;

      if (!ui) {
        return this.toXml();
      }

      if (typeof ui.getFileData === "function") {
        const data = ui.getFileData(true);
        return { success: true, data };
      }

      return this.toXml();
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  fromCompressedXml(data: string): APIResult {
    try {
      const ui = this._api.editorUi as EditorUiInternal | null;

      if (!ui) {
        return this.fromXml(data);
      }

      if (typeof ui.setFileData === "function") {
        ui.setFileData(data);
        return { success: true };
      }

      return this.fromXml(data);
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  validateXml(xml: string): APIResult<XmlValidationResult> {
    try {
      if (!xml || typeof xml !== "string") {
        return {
          success: true,
          data: { valid: false, error: "Invalid input: not a string" },
        };
      }

      const doc = mxUtils.parseXml(xml);

      const parseError = doc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        return {
          success: true,
          data: { valid: false, error: "XML parsing error" },
        };
      }

      const root = doc.documentElement;
      if (!root) {
        return {
          success: true,
          data: { valid: false, error: "No root element" },
        };
      }

      const tagName = root.tagName || root.nodeName;
      if (tagName !== "mxGraphModel" && tagName !== "mxfile") {
        return {
          success: true,
          data: {
            valid: false,
            error: `Unexpected root element: ${tagName}. Expected mxGraphModel or mxfile`,
          },
        };
      }

      return {
        success: true,
        data: { valid: true, rootElement: tagName },
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
