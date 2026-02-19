// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file StyleManager.ts - Styling and formatting operations
 * @description Manages cell styles, default styles, and style manipulation
 */

import type { DrawioAPI } from "./DrawioAPI.js";
import type { APIResult, CellStyle } from "./types.js";

const STYLE_MAP: Record<string, string> = {
  fillColor: "fillColor",
  strokeColor: "strokeColor",
  strokeWidth: "strokeWidth",
  fontColor: "fontColor",
  fontSize: "fontSize",
  fontFamily: "fontFamily",
  opacity: "opacity",
  rounded: "rounded",
  shadow: "shadow",
  shape: "shape",
  perimeter: "perimeter",
  verticalAlign: "verticalAlign",
  align: "align",
  spacingTop: "spacingTop",
  spacingBottom: "spacingBottom",
  spacingLeft: "spacingLeft",
  spacingRight: "spacingRight",
  dashed: "dashed",
  dashPattern: "dashPattern",
  gradientColor: "gradientColor",
  gradientDirection: "gradientDirection",
  glass: "glass",
  labelBackgroundColor: "labelBackgroundColor",
  labelBorderColor: "labelBorderColor",
};

interface MockCellInternal {
  getStyle(): string;
}

interface ModelInternal {
  getCell(id: string): MockCellInternal | null;
  beginUpdate(): void;
  endUpdate(): void;
  setStyle(cell: MockCellInternal, style: string): void;
}

interface GraphInternal {
  getSelectionCells(): MockCellInternal[];
  getStylesheet(): {
    getDefaultVertexStyle(): Map<string, unknown> | Record<string, unknown>;
    getDefaultEdgeStyle(): Map<string, unknown> | Record<string, unknown>;
  };
  getView(): {
    getState(
      cell: MockCellInternal,
    ): { style?: Map<string, unknown> | Record<string, unknown> } | null;
  };
}

export class StyleManager {
  private _api: DrawioAPI;

  constructor(api: DrawioAPI) {
    this._api = api;
  }

  private _buildStyleString(styleObj?: CellStyle): string {
    if (!styleObj) return "";
    const parts: string[] = [];
    for (const key in styleObj) {
      if (Object.prototype.hasOwnProperty.call(styleObj, key)) {
        const mxKey = STYLE_MAP[key] || key;
        parts.push(`${mxKey}=${styleObj[key]}`);
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
        const eqIndex = pair.indexOf("=");
        if (eqIndex > 0) {
          const key = pair.substring(0, eqIndex);
          const value = pair.substring(eqIndex + 1);
          result[key] = value;
        } else if (pair.length > 0) {
          result[pair] = "1";
        }
      }
    }
    return result;
  }

  getStyle(cellId: string): APIResult<Record<string, string>> {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const styleString = cell.getStyle() || "";
      const styleObj = this._parseStyleString(styleString);

      return { success: true, data: styleObj };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  setStyle(cellId: string, style: CellStyle): APIResult {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const styleString = this._buildStyleString(style);

      model.beginUpdate();
      try {
        model.setStyle(cell, styleString);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  updateStyle(cellId: string, updates: CellStyle): APIResult {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      const currentStyle = this._parseStyleString(cell.getStyle());
      const mergedStyle: Record<string, string | number | undefined> = {
        ...currentStyle,
      };

      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const mxKey = STYLE_MAP[key] || key;
          mergedStyle[mxKey] = updates[key];
        }
      }

      const styleString = this._buildStyleString(mergedStyle as CellStyle);

      model.beginUpdate();
      try {
        model.setStyle(cell, styleString);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getCellStyleString(cellId: string): APIResult<string> {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      return { success: true, data: cell.getStyle() || "" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  setCellStyleString(cellId: string, styleString: string): APIResult {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      model.beginUpdate();
      try {
        model.setStyle(cell, styleString);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  applyStyleToSelection(style: CellStyle): APIResult<{ updated: number }> {
    try {
      const graph = this._api.graph as GraphInternal | null;
      const model = this._api.model as ModelInternal | null;

      if (!graph || !model) {
        return { success: false, error: "API not initialized" };
      }

      const cells = graph.getSelectionCells() || [];
      if (cells.length === 0) {
        return { success: false, error: "No cells selected" };
      }

      model.beginUpdate();
      try {
        for (const cell of cells) {
          const currentStyle = this._parseStyleString(cell.getStyle());
          const mergedStyle: Record<string, string | number | undefined> = {
            ...currentStyle,
          };

          for (const key in style) {
            if (Object.prototype.hasOwnProperty.call(style, key)) {
              const mxKey = STYLE_MAP[key] || key;
              mergedStyle[mxKey] = style[key];
            }
          }

          const styleString = this._buildStyleString(mergedStyle as CellStyle);
          model.setStyle(cell, styleString);
        }
      } finally {
        model.endUpdate();
      }

      return { success: true, data: { updated: cells.length } };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getDefaultVertexStyle(): APIResult<Record<string, unknown>> {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const stylesheet = graph.getStylesheet();
      const defaultStyle = stylesheet.getDefaultVertexStyle();

      const styleObj: Record<string, unknown> = {};
      if (defaultStyle) {
        if (defaultStyle instanceof Map) {
          defaultStyle.forEach((value, key) => {
            styleObj[key] = value;
          });
        } else {
          Object.assign(styleObj, defaultStyle);
        }
      }

      return { success: true, data: styleObj };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getDefaultEdgeStyle(): APIResult<Record<string, unknown>> {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const stylesheet = graph.getStylesheet();
      const defaultStyle = stylesheet.getDefaultEdgeStyle();

      const styleObj: Record<string, unknown> = {};
      if (defaultStyle) {
        if (defaultStyle instanceof Map) {
          defaultStyle.forEach((value, key) => {
            styleObj[key] = value;
          });
        } else {
          Object.assign(styleObj, defaultStyle);
        }
      }

      return { success: true, data: styleObj };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  setDefaultVertexStyle(style: CellStyle): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const stylesheet = graph.getStylesheet();
      const defaultStyle = stylesheet.getDefaultVertexStyle() || {};

      for (const key in style) {
        if (Object.prototype.hasOwnProperty.call(style, key)) {
          const mxKey = STYLE_MAP[key] || key;
          if (defaultStyle instanceof Map) {
            defaultStyle.set(mxKey, style[key]);
          } else {
            (defaultStyle as Record<string, unknown>)[mxKey] = style[key];
          }
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  setDefaultEdgeStyle(style: CellStyle): APIResult {
    try {
      const graph = this._api.graph as GraphInternal | null;

      if (!graph) {
        return { success: false, error: "API not initialized" };
      }

      const stylesheet = graph.getStylesheet();
      const defaultStyle = stylesheet.getDefaultEdgeStyle() || {};

      for (const key in style) {
        if (Object.prototype.hasOwnProperty.call(style, key)) {
          const mxKey = STYLE_MAP[key] || key;
          if (defaultStyle instanceof Map) {
            defaultStyle.set(mxKey, style[key]);
          } else {
            (defaultStyle as Record<string, unknown>)[mxKey] = style[key];
          }
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getComputedStyle(cellId: string): APIResult<Record<string, unknown>> {
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

      const state = graph.getView().getState(cell);
      if (!state || !state.style) {
        return this.getStyle(cellId) as APIResult<Record<string, unknown>>;
      }

      const styleObj: Record<string, unknown> = {};
      if (state.style instanceof Map) {
        state.style.forEach((value, key) => {
          styleObj[key] = value;
        });
      } else {
        Object.assign(styleObj, state.style);
      }

      return { success: true, data: styleObj };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  removeStyleProperties(cellId: string, properties: string[]): APIResult {
    try {
      const model = this._api.model as ModelInternal | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      const cell = model.getCell(cellId);
      if (!cell) {
        return { success: false, error: "Cell not found" };
      }

      if (!Array.isArray(properties)) {
        return { success: false, error: "Properties must be an array" };
      }

      const currentStyle = this._parseStyleString(cell.getStyle());

      for (const prop of properties) {
        const mxKey = STYLE_MAP[prop] || prop;
        delete currentStyle[mxKey];
      }

      const styleString = this._buildStyleString(currentStyle as CellStyle);

      model.beginUpdate();
      try {
        model.setStyle(cell, styleString);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
