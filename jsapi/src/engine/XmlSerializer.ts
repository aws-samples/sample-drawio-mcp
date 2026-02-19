// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file XmlSerializer.ts - Generate .drawio XML files
 * @description Serializes DrawioAPI model to valid .drawio XML format.
 */

import type { DrawioAPI } from "../DrawioAPI.js";
import type { APIResult, SerializeOptions, Point } from "../types.js";

interface CellInternal {
  id?: string;
  value?: string | null;
  style?: string;
  vertex?: boolean;
  edge?: boolean;
  parent?: CellInternal | null;
  source?: CellInternal | null;
  target?: CellInternal | null;
  geometry?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: Point[];
  } | null;
  getId?(): string;
}

interface ModelInternal {
  getCell(id: string): CellInternal | null;
  getChildren(parent: unknown): CellInternal[];
}

function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export class XmlSerializer {
  serialize(api: DrawioAPI, options: SerializeOptions = {}): APIResult<string> {
    try {
      const diagramName = options.diagramName || "Page-1";
      const wrapInMxFile = options.wrapInMxFile !== false;

      const graphModelXml = this._serializeGraphModel(api);

      if (wrapInMxFile) {
        const fullXml = this._wrapInMxFile(graphModelXml, diagramName);
        return { success: true, data: fullXml };
      }

      return { success: true, data: graphModelXml };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  private _serializeGraphModel(api: DrawioAPI): string {
    const model = api.model as ModelInternal;
    const defaultParent = model.getCell("1");
    const cells = defaultParent ? model.getChildren(defaultParent) : [];

    let cellsXml = "";

    cellsXml += '      <mxCell id="0" />\n';
    cellsXml += '      <mxCell id="1" parent="0" />\n';

    for (const cell of cells) {
      cellsXml += this._serializeCell(cell);
    }

    return `<mxGraphModel dx="1426" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850">
    <root>
${cellsXml}    </root>
  </mxGraphModel>`;
  }

  private _serializeCell(cell: CellInternal): string {
    const id = cell.id || (cell.getId ? cell.getId() : "");
    const value = escapeXml(cell.value || "");
    const style = cell.style || "";

    if (cell.vertex) {
      return this._serializeVertex(id, value, style, cell);
    } else if (cell.edge) {
      return this._serializeEdge(id, value, style, cell);
    }

    return "";
  }

  private _serializeVertex(
    id: string,
    value: string,
    style: string,
    cell: CellInternal,
  ): string {
    const geo = cell.geometry || {};
    const parentId = cell.parent
      ? cell.parent.id || (cell.parent.getId ? cell.parent.getId() : "1")
      : "1";

    let xml = `      <mxCell id="${escapeXml(id)}" value="${value}" style="${escapeXml(style)}" vertex="1" parent="${escapeXml(parentId)}">\n`;
    xml += `        <mxGeometry x="${geo.x || 0}" y="${geo.y || 0}" width="${geo.width || 100}" height="${geo.height || 50}" as="geometry" />\n`;
    xml += "      </mxCell>\n";

    return xml;
  }

  private _serializeEdge(
    id: string,
    value: string,
    style: string,
    cell: CellInternal,
  ): string {
    const sourceId = cell.source
      ? cell.source.id || (cell.source.getId ? cell.source.getId() : "")
      : "";
    const targetId = cell.target
      ? cell.target.id || (cell.target.getId ? cell.target.getId() : "")
      : "";
    const parentId = cell.parent
      ? cell.parent.id || (cell.parent.getId ? cell.parent.getId() : "1")
      : "1";

    let xml = `      <mxCell id="${escapeXml(id)}" value="${value}" style="${escapeXml(style)}" edge="1" parent="${escapeXml(parentId)}"`;

    if (sourceId) xml += ` source="${escapeXml(sourceId)}"`;
    if (targetId) xml += ` target="${escapeXml(targetId)}"`;

    xml += ">\n";

    const geo = cell.geometry;
    if (geo && geo.points && geo.points.length > 0) {
      xml += '        <mxGeometry relative="1" as="geometry">\n';
      xml += '          <Array as="points">\n';
      for (const point of geo.points) {
        xml += `            <mxPoint x="${point.x}" y="${point.y}" />\n`;
      }
      xml += "          </Array>\n";
      xml += "        </mxGeometry>\n";
    } else {
      xml += '        <mxGeometry relative="1" as="geometry" />\n';
    }

    xml += "      </mxCell>\n";

    return xml;
  }

  private _wrapInMxFile(graphModelXml: string, diagramName: string): string {
    const timestamp = new Date().toISOString();
    return `<mxfile host="drawio-jsapi" modified="${timestamp}" agent="DrawioJSAPI/1.0.0" version="1.0.0">
  <diagram id="diagram-1" name="${escapeXml(diagramName)}">
  ${graphModelXml}
  </diagram>
</mxfile>`;
  }
}
