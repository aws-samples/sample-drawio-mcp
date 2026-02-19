// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file CellManager.ts - Cell/Shape CRUD operations
 * @description Manages creation, modification, and deletion of cells (vertices and edges)
 */

import type { DrawioAPI } from "./DrawioAPI.js";
import type {
  APIResult,
  CellStyle,
  CellData,
  VertexOptions,
  EdgeOptions,
  UpdateCellOptions,
  AwsIconOptions,
  AwsGroupOptions,
  AwsGroupTypeInfo,
  Point,
} from "./types.js";
import {
  findIcon,
  buildResourceIconStyle,
  buildGroupStyle,
  AWS4_GROUPS,
} from "./stencils/aws4/index.js";

// Declare global mxGraph types
declare const mxPoint: new (x: number, y: number) => Point;

interface MockCellInternal {
  id: string;
  value: string | null;
  geometry: MockGeometryInternal | null;
  style: string;
  vertex: boolean;
  edge: boolean;
  parent: MockCellInternal | null;
  children: MockCellInternal[];
  source: MockCellInternal | null;
  target: MockCellInternal | null;
  getId(): string;
  getValue(): string | null;
  getStyle(): string;
  getGeometry(): MockGeometryInternal | null;
  getParent(): MockCellInternal | null;
}

interface MockGeometryInternal {
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  clone(): MockGeometryInternal;
}

interface ModelInternal {
  getCell(id: string): MockCellInternal | null;
  getChildren(parent: unknown): MockCellInternal[];
  isVertex(cell: unknown): boolean;
  isEdge(cell: unknown): boolean;
  beginUpdate(): void;
  endUpdate(): void;
  setValue(cell: MockCellInternal, value: string): void;
  setGeometry(cell: MockCellInternal, geometry: MockGeometryInternal): void;
  setStyle(cell: MockCellInternal, style: string): void;
  getRoot(): MockCellInternal;
}

interface GraphInternal {
  getDefaultParent(): MockCellInternal;
  insertVertex(
    parent: MockCellInternal,
    id: string | null,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    style: string,
  ): MockCellInternal;
  insertEdge(
    parent: MockCellInternal,
    id: string | null,
    label: string,
    source: MockCellInternal,
    target: MockCellInternal,
    style: string,
  ): MockCellInternal;
  removeCells(cells: MockCellInternal[]): MockCellInternal[];
  cloneCells(cells: MockCellInternal[]): MockCellInternal[];
  addCells(
    cells: MockCellInternal[],
    parent: MockCellInternal,
  ): MockCellInternal[];
  groupCells(
    group: MockCellInternal | null,
    border: number,
    cells: MockCellInternal[],
  ): MockCellInternal;
  ungroupCells(groups: MockCellInternal[]): MockCellInternal[];
  getEdges(
    cell: MockCellInternal,
    parent: unknown,
    incoming: boolean,
    outgoing: boolean,
  ): MockCellInternal[];
  getSelectionCells(): MockCellInternal[];
  setSelectionCells(cells: MockCellInternal[]): void;
  clearSelection(): void;
}

export class CellManager {
  private _api: DrawioAPI;

  constructor(api: DrawioAPI) {
    this._api = api;
  }

  private _buildStyleString(
    styleObj?: CellStyle | Record<string, string | number | undefined>,
  ): string {
    if (!styleObj) return "";
    const parts: string[] = [];
    for (const key in styleObj) {
      if (Object.prototype.hasOwnProperty.call(styleObj, key)) {
        const value = styleObj[key];
        if (value !== undefined) {
          parts.push(`${key}=${value}`);
        }
      }
    }
    return parts.join(";");
  }

  private _parseStyleString(styleString?: string): Record<string, string> {
    if (!styleString) return {};
    const result: Record<string, string> = {};
    const pairs = styleString.split(";");
    for (const pair of pairs) {
      if (pair) {
        const [key, value] = pair.split("=");
        if (key) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  insertVertex(options: VertexOptions): APIResult<{ id: string }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      if (!options || !options.geometry) {
        return { success: false, error: "Geometry is required" };
      }

      const geo = options.geometry;
      const parent = options.parentId
        ? model.getCell(options.parentId)
        : graph.getDefaultParent();

      if (!parent) {
        return { success: false, error: "Parent cell not found" };
      }

      const id = options.id || null;
      const label = options.label || "";
      const style =
        typeof options.style === "string"
          ? options.style
          : this._buildStyleString(options.style);

      model.beginUpdate();
      try {
        const cell = graph.insertVertex(
          parent,
          id,
          label,
          geo.x,
          geo.y,
          geo.width,
          geo.height,
          style,
        );
        return { success: true, data: { id: cell.getId() } };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  insertEdge(options: EdgeOptions): APIResult<{ id: string }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      if (!options || !options.sourceId || !options.targetId) {
        return { success: false, error: "Source and target IDs are required" };
      }

      const source = model.getCell(options.sourceId);
      const target = model.getCell(options.targetId);

      if (!source) {
        return { success: false, error: "Source cell not found" };
      }
      if (!target) {
        return { success: false, error: "Target cell not found" };
      }

      const parent = graph.getDefaultParent();
      const id = options.id || null;
      const label = options.label || "";
      const style =
        typeof options.style === "string"
          ? options.style
          : this._buildStyleString(options.style);

      model.beginUpdate();
      try {
        const cell = graph.insertEdge(parent, id, label, source, target, style);

        if (options.waypoints && options.waypoints.length > 0) {
          const geometry = cell.getGeometry();
          if (geometry) {
            geometry.points = options.waypoints.map(
              (wp) => new mxPoint(wp.x, wp.y),
            );
          }
        }

        return { success: true, data: { id: cell.getId() } };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  removeCell(cellId: string): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      model.beginUpdate();
      try {
        graph.removeCells([cell]);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  removeCells(cellIds: string[]): APIResult<{ removed: number }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      if (!Array.isArray(cellIds)) {
        return { success: false, error: "cellIds must be an array" };
      }

      const cells = cellIds
        .map((id) => model.getCell(id))
        .filter((cell): cell is MockCellInternal => cell !== null);

      if (cells.length === 0) {
        return { success: false, error: "No valid cells found" };
      }

      model.beginUpdate();
      try {
        graph.removeCells(cells);
      } finally {
        model.endUpdate();
      }

      return { success: true, data: { removed: cells.length } };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getCell(cellId: string): APIResult<CellData> {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const cellData = this._cellToData(cell, model);
      return { success: true, data: cellData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  private _cellToData(cell: MockCellInternal, model: ModelInternal): CellData {
    const geo = cell.getGeometry();

    const data: CellData = {
      id: cell.getId(),
      label: cell.getValue() || "",
      style: cell.getStyle() || "",
      isVertex: model.isVertex(cell),
      isEdge: model.isEdge(cell),
      parentId: cell.getParent() ? cell.getParent()!.getId() : null,
    };

    if (geo && data.isVertex) {
      data.geometry = {
        x: geo.x,
        y: geo.y,
        width: geo.width,
        height: geo.height,
      };
    }

    if (data.isEdge) {
      data.sourceId = cell.source ? cell.source.getId() : null;
      data.targetId = cell.target ? cell.target.getId() : null;
    }

    return data;
  }

  getCells(): APIResult<CellData[]> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const parent = graph.getDefaultParent();
      const children = model.getChildren(parent) || [];
      const cellsData = children.map((cell) => this._cellToData(cell, model));

      return { success: true, data: cellsData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getVertices(): APIResult<CellData[]> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const parent = graph.getDefaultParent();
      const children = model.getChildren(parent) || [];
      const vertices = children
        .filter((cell) => model.isVertex(cell))
        .map((cell) => this._cellToData(cell, model));

      return { success: true, data: vertices };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getEdges(): APIResult<CellData[]> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const parent = graph.getDefaultParent();
      const children = model.getChildren(parent) || [];
      const edges = children
        .filter((cell) => model.isEdge(cell))
        .map((cell) => this._cellToData(cell, model));

      return { success: true, data: edges };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  updateCell(cellId: string, updates: UpdateCellOptions): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      model.beginUpdate();
      try {
        if (updates.label !== undefined) {
          model.setValue(cell, updates.label);
        }

        if (updates.geometry) {
          const geo = cell.getGeometry();
          if (geo) {
            const newGeo = geo.clone();
            if (updates.geometry.x !== undefined) newGeo.x = updates.geometry.x;
            if (updates.geometry.y !== undefined) newGeo.y = updates.geometry.y;
            if (updates.geometry.width !== undefined)
              newGeo.width = updates.geometry.width;
            if (updates.geometry.height !== undefined)
              newGeo.height = updates.geometry.height;
            model.setGeometry(cell, newGeo);
          }
        }

        if (updates.style) {
          let styleString: string;
          if (typeof updates.style === "string") {
            styleString = updates.style;
          } else {
            const currentStyle = this._parseStyleString(cell.getStyle());
            const mergedStyle = { ...currentStyle, ...updates.style };
            styleString = this._buildStyleString(mergedStyle);
          }
          model.setStyle(cell, styleString);
        }
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  moveCell(cellId: string, x: number, y: number): APIResult {
    return this.updateCell(cellId, { geometry: { x, y } });
  }

  resizeCell(cellId: string, width: number, height: number): APIResult {
    return this.updateCell(cellId, { geometry: { width, height } });
  }

  cloneCell(
    cellId: string,
    offsetX = 20,
    offsetY = 20,
  ): APIResult<{ id: string }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      model.beginUpdate();
      try {
        const clones = graph.cloneCells([cell]);
        if (clones && clones.length > 0) {
          const clone = clones[0];
          const geo = clone.getGeometry();
          if (geo) {
            geo.x += offsetX;
            geo.y += offsetY;
          }
          graph.addCells([clone], graph.getDefaultParent());
          return { success: true, data: { id: clone.getId() } };
        }
        return { success: false, error: "Clone failed" };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  groupCells(cellIds: string[]): APIResult<{ id: string }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      if (!Array.isArray(cellIds) || cellIds.length < 2) {
        return {
          success: false,
          error: "At least 2 cells required for grouping",
        };
      }

      const cells = cellIds
        .map((id) => model.getCell(id))
        .filter((cell): cell is MockCellInternal => cell !== null);

      if (cells.length < 2) {
        return { success: false, error: "At least 2 valid cells required" };
      }

      model.beginUpdate();
      try {
        const group = graph.groupCells(null, 0, cells);
        return { success: true, data: { id: group.getId() } };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  ungroupCells(groupId: string): APIResult<{ ids: string[] }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const group = model.getCell(groupId);
      if (!group) {
        return { success: false, error: "Group not found" };
      }

      model.beginUpdate();
      try {
        const cells = graph.ungroupCells([group]);
        const releasedIds = cells.map((cell) => cell.getId());
        return { success: true, data: { ids: releasedIds } };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getParent(cellId: string): APIResult<CellData | null> {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const parent = cell.getParent();
      if (!parent || parent === model.getRoot()) {
        return { success: true, data: null };
      }

      return { success: true, data: this._cellToData(parent, model) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getChildren(cellId: string): APIResult<CellData[]> {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const children = model.getChildren(cell) || [];
      const childrenData = children.map((child) =>
        this._cellToData(child, model),
      );

      return { success: true, data: childrenData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getConnectedEdges(
    cellId: string,
    incoming = true,
    outgoing = true,
  ): APIResult<CellData[]> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const edges = graph.getEdges(cell, null, incoming, outgoing) || [];
      const edgesData = edges.map((edge) => this._cellToData(edge, model));

      return { success: true, data: edgesData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getSelection(): APIResult<CellData[]> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cells = graph.getSelectionCells() || [];
      const cellsData = cells.map((cell) => this._cellToData(cell, model));

      return { success: true, data: cellsData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  setSelection(cellIds: string[]): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cells = cellIds
        .map((id) => model.getCell(id))
        .filter((cell): cell is MockCellInternal => cell !== null);

      graph.setSelectionCells(cells);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  clearSelection(): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      graph.clearSelection();
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  // ===========================================================================
  // AWS4 ICON METHODS
  // ===========================================================================

  insertAwsIcon(options: AwsIconOptions): APIResult<{ id: string }> {
    try {
      if (!options) {
        return { success: false, error: "Options are required" };
      }

      if (options.style) {
        const geometry = {
          x: options.geometry?.x || 0,
          y: options.geometry?.y || 0,
          width: options.geometry?.width || 78,
          height: options.geometry?.height || 78,
        };

        return this.insertVertex({
          id: options.id,
          parentId: options.parentId,
          label: options.label || "",
          geometry,
          style: this._parseStyleString(options.style),
        });
      }

      if (!options.icon) {
        return { success: false, error: "Icon name or style is required" };
      }

      const iconDef = findIcon(options.icon, options.category);

      const fillColor =
        options.fillColor || (iconDef ? iconDef.fillColor : "#232F3E");
      const iconName = iconDef ? iconDef.icon : options.icon;
      const style = buildResourceIconStyle(iconName, { fillColor });

      const geometry = {
        x: options.geometry?.x || 0,
        y: options.geometry?.y || 0,
        width: options.geometry?.width || iconDef?.width || 78,
        height: options.geometry?.height || iconDef?.height || 78,
      };

      return this.insertVertex({
        id: options.id,
        parentId: options.parentId,
        label: options.label || iconDef?.name || options.icon,
        geometry,
        style: this._parseStyleString(style),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  insertAwsGroup(options: AwsGroupOptions): APIResult<{ id: string }> {
    try {
      if (!options) {
        return { success: false, error: "Options are required" };
      }

      if (
        !options.geometry ||
        options.geometry.width === undefined ||
        options.geometry.height === undefined
      ) {
        return {
          success: false,
          error: "Geometry with width and height is required for groups",
        };
      }

      if (options.style) {
        return this.insertVertex({
          id: options.id,
          parentId: options.parentId,
          label: options.label || "",
          geometry: options.geometry,
          style: this._parseStyleString(options.style),
        });
      }

      if (!options.groupType) {
        return { success: false, error: "Group type or style is required" };
      }

      if (!AWS4_GROUPS[options.groupType]) {
        return {
          success: false,
          error: `Unknown group type: ${options.groupType}. Valid types: ${Object.keys(AWS4_GROUPS).join(", ")}`,
        };
      }

      const style = buildGroupStyle(options.groupType, {
        strokeColor: options.strokeColor,
        fillColor: options.fillColor,
        fontColor: options.fontColor,
      });

      const groupDef = AWS4_GROUPS[options.groupType];
      const label = options.label !== undefined ? options.label : groupDef.name;

      return this.insertVertex({
        id: options.id,
        parentId: options.parentId,
        label,
        geometry: options.geometry,
        style: this._parseStyleString(style),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getAwsGroupTypes(): APIResult<AwsGroupTypeInfo[]> {
    try {
      const types = Object.entries(AWS4_GROUPS).map(([key, def]) => ({
        type: key,
        name: def.name,
        hasIcon: !def.simple,
      }));
      return { success: true, data: types };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Create a data URI from an SVG string.
   * @param svgContent - SVG content as string
   * @returns URL-encoded data URI
   */
  createSvgDataUri(svgContent: string): string {
    // URL encode the SVG for draw.io compatibility
    const encoded = encodeURIComponent(svgContent)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:image/svg+xml,${encoded}`;
  }

  /**
   * Create a data URI from a PNG/JPG image buffer or base64 string.
   * @param imageData - Image data as Buffer or base64 string
   * @param mimeType - MIME type (default: 'image/png')
   * @returns Base64-encoded data URI
   */
  createImageDataUri(
    imageData: Buffer | string,
    mimeType: string = "image/png",
  ): string {
    const base64 =
      typeof imageData === "string" ? imageData : imageData.toString("base64");
    return `data:${mimeType},${base64};base64,${base64}`;
  }

  /**
   * Insert a vertex with a custom image (SVG or raster).
   * @param options - Image vertex options
   * @returns API result with cell ID
   */
  insertImageVertex(options: {
    id?: string | null;
    label?: string;
    geometry: { x: number; y: number; width?: number; height?: number };
    imageDataUri: string;
    maintainAspect?: boolean;
    styleOverrides?: CellStyle;
  }): APIResult<{ id: string }> {
    const baseStyle: CellStyle = {
      shape: "image",
      verticalLabelPosition: "bottom",
      labelBackgroundColor: "default",
      verticalAlign: "top",
      aspect: "fixed",
      imageAspect: options.maintainAspect !== false ? "0" : undefined,
      image: options.imageDataUri,
      ...options.styleOverrides,
    };

    return this.insertVertex({
      id: options.id,
      label: options.label,
      geometry: {
        x: options.geometry.x,
        y: options.geometry.y,
        width: options.geometry.width || 100,
        height: options.geometry.height || 100,
      },
      style: baseStyle,
    });
  }
}
