// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file XmlParser.ts - Parse .drawio XML files
 * @description Parses .drawio XML files into DrawioAPI model.
 */

import { DOMParser } from "@xmldom/xmldom";
import pako from "pako";
import type { DrawioAPI } from "../DrawioAPI.js";
import type { APIResult, ParseResult, CellStyle } from "../types.js";

export class XmlParser {
  parse(xml: string, api: DrawioAPI): APIResult<ParseResult> {
    try {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const root = doc.documentElement;

      if (!root) {
        return { success: false, error: "Invalid XML: no root element" };
      }

      if (root.tagName === "mxfile") {
        return this._parseMxFile(root, api);
      } else if (root.tagName === "mxGraphModel") {
        return this._parseMxGraphModel(root, api);
      }

      return { success: false, error: `Unknown XML format: ${root.tagName}` };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  private _parseMxFile(
    mxfile: Element,
    api: DrawioAPI,
  ): APIResult<ParseResult> {
    const diagrams = mxfile.getElementsByTagName("diagram");
    if (diagrams.length === 0) {
      return { success: false, error: "No diagram found in mxfile" };
    }

    const diagram = diagrams[0];
    const diagramName = diagram.getAttribute("name") || "Page-1";

    let content = this._getTextContent(diagram).trim();

    if (!content) {
      return { success: false, error: "Empty diagram content" };
    }

    if (!content.startsWith("<")) {
      try {
        content = this._decompress(content);
      } catch (e) {
        return {
          success: false,
          error: `Failed to decompress diagram: ${(e as Error).message}`,
        };
      }
    }

    const innerDoc = new DOMParser().parseFromString(content, "text/xml");
    const graphModel = innerDoc.documentElement;

    if (!graphModel || graphModel.tagName !== "mxGraphModel") {
      return {
        success: false,
        error: "Invalid diagram content: expected mxGraphModel",
      };
    }

    const result = this._parseMxGraphModel(graphModel, api);
    if (result.success) {
      result.data = { diagramName, pageCount: diagrams.length };
    }
    return result;
  }

  private _getTextContent(element: Element): string {
    if (
      (element as Element & { textContent?: string }).textContent !== undefined
    ) {
      return (element as Element & { textContent: string }).textContent;
    }
    let text = "";
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      if (child.nodeType === 3) {
        text += child.nodeValue || "";
      }
    }
    return text;
  }

  private _decompress(encoded: string): string {
    encoded = encoded.replace(/\s/g, "");
    const decoded = Buffer.from(encoded, "base64");
    const inflated = pako.inflateRaw(decoded, { to: "string" });
    return decodeURIComponent(inflated);
  }

  private _parseMxGraphModel(
    graphModel: Element,
    api: DrawioAPI,
  ): APIResult<ParseResult> {
    const root = graphModel.getElementsByTagName("root")[0];
    if (!root) {
      return { success: false, error: "No root element in mxGraphModel" };
    }

    const cells = root.getElementsByTagName("mxCell");
    const cellMap = new Map<string, boolean>();
    const edgesToProcess: Element[] = [];

    for (let i = 0; i < cells.length; i++) {
      const cellNode = cells[i];
      const id = cellNode.getAttribute("id");

      if (id === "0" || id === "1") continue;

      const isVertex = cellNode.getAttribute("vertex") === "1";
      const isEdge = cellNode.getAttribute("edge") === "1";

      if (isVertex) {
        this._parseVertex(cellNode, api);
        if (id) cellMap.set(id, true);
      } else if (isEdge) {
        edgesToProcess.push(cellNode);
      }
    }

    for (const cellNode of edgesToProcess) {
      this._parseEdge(cellNode, api);
    }

    return { success: true };
  }

  private _parseVertex(cellNode: Element, api: DrawioAPI): void {
    const id = cellNode.getAttribute("id") || undefined;
    const value = cellNode.getAttribute("value") || "";
    const style = cellNode.getAttribute("style") || "";
    const parentId = cellNode.getAttribute("parent");

    const geoNode = cellNode.getElementsByTagName("mxGeometry")[0];
    const geometry = {
      x: parseFloat(geoNode?.getAttribute("x") || "0"),
      y: parseFloat(geoNode?.getAttribute("y") || "0"),
      width: parseFloat(geoNode?.getAttribute("width") || "100"),
      height: parseFloat(geoNode?.getAttribute("height") || "50"),
    };

    api.cells.insertVertex({
      id,
      label: value,
      geometry,
      style: this._parseStyleString(style),
      parentId: parentId !== "1" ? parentId || undefined : undefined,
    });
  }

  private _parseEdge(cellNode: Element, api: DrawioAPI): void {
    const id = cellNode.getAttribute("id") || undefined;
    const value = cellNode.getAttribute("value") || "";
    const style = cellNode.getAttribute("style") || "";
    const sourceId = cellNode.getAttribute("source");
    const targetId = cellNode.getAttribute("target");

    if (!sourceId || !targetId) {
      return;
    }

    const waypoints: { x: number; y: number }[] = [];
    const geoNode = cellNode.getElementsByTagName("mxGeometry")[0];
    if (geoNode) {
      const arrayNode = geoNode.getElementsByTagName("Array")[0];
      if (arrayNode) {
        const points = arrayNode.getElementsByTagName("mxPoint");
        for (let i = 0; i < points.length; i++) {
          waypoints.push({
            x: parseFloat(points[i].getAttribute("x") || "0"),
            y: parseFloat(points[i].getAttribute("y") || "0"),
          });
        }
      }
    }

    api.cells.insertEdge({
      id,
      label: value,
      sourceId,
      targetId,
      style: this._parseStyleString(style),
      waypoints: waypoints.length > 0 ? waypoints : undefined,
    });
  }

  private _parseStyleString(styleString: string): CellStyle {
    if (!styleString) return {};

    const result: CellStyle = {};
    const pairs = styleString.split(";");

    for (const pair of pairs) {
      if (pair) {
        const eqIndex = pair.indexOf("=");
        if (eqIndex > 0) {
          const key = pair.substring(0, eqIndex);
          const value = pair.substring(eqIndex + 1);
          result[key] = value;
        } else if (pair.trim()) {
          result[pair.trim()] = "1";
        }
      }
    }

    return result;
  }
}
