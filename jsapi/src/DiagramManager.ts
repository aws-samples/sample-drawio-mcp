// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file DiagramManager.ts - Document/page lifecycle operations
 * @description Manages diagram creation, loading, saving, and page operations
 */

import type { DrawioAPI } from "./DrawioAPI.js";
import type { APIResult, DiagramInfo, PageData } from "./types.js";

// Declare global mxGraph types
declare const mxCell: new () => {
  setId: (id: string) => void;
  insert: (cell: unknown) => void;
};
declare const mxCodec: new () => { encode: (model: unknown) => unknown };
declare const mxUtils: {
  getXml: (node: unknown) => string;
  parseXml: (xml: string) => Document;
};

/**
 * Manages diagram-level operations including document lifecycle and pages.
 */
export class DiagramManager {
  private _api: DrawioAPI;

  constructor(api: DrawioAPI) {
    this._api = api;
  }

  create(): APIResult {
    try {
      const model = this._api.model as {
        beginUpdate: () => void;
        endUpdate: () => void;
        clear: () => void;
        setRoot: (root: unknown) => void;
      } | null;
      const graph = this._api.graph;

      if (!model || !graph) {
        return { success: false, error: "API not initialized" };
      }

      model.beginUpdate();
      try {
        model.clear();
        const root = new mxCell();
        root.setId("0");
        const defaultParent = new mxCell();
        defaultParent.setId("1");
        root.insert(defaultParent);
        model.setRoot(root);
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  clear(): APIResult {
    try {
      const model = this._api.model as {
        beginUpdate: () => void;
        endUpdate: () => void;
        getChildren: (parent: unknown) => unknown[];
      } | null;
      const graph = this._api.graph as {
        getDefaultParent: () => unknown;
        removeCells: (cells: unknown[]) => void;
      } | null;

      if (!model || !graph) {
        return { success: false, error: "API not initialized" };
      }

      model.beginUpdate();
      try {
        const parent = graph.getDefaultParent();
        const children = model.getChildren(parent);
        if (children && children.length > 0) {
          graph.removeCells(children);
        }
      } finally {
        model.endUpdate();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getXml(): APIResult<string> {
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

  setXml(xml: string): APIResult {
    try {
      const model = this._api.model as {
        beginUpdate: () => void;
        endUpdate: () => void;
      } | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      if (!xml || typeof xml !== "string") {
        return { success: false, error: "Invalid XML input" };
      }

      const doc = mxUtils.parseXml(xml);
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

  getInfo(): APIResult<DiagramInfo> {
    try {
      const model = this._api.model as {
        getChildren: (parent: unknown) => unknown[];
        isVertex: (cell: unknown) => boolean;
        isEdge: (cell: unknown) => boolean;
      } | null;
      const graph = this._api.graph as {
        getDefaultParent: () => unknown;
      } | null;
      const ui = this._api.editorUi as {
        pages?: { length: number };
        currentPage?: { getId: () => string };
      } | null;

      if (!model || !graph) {
        return { success: false, error: "API not initialized" };
      }

      const parent = graph.getDefaultParent();
      const cells = model.getChildren(parent) || [];

      let vertexCount = 0;
      let edgeCount = 0;

      for (const cell of cells) {
        if (model.isVertex(cell)) {
          vertexCount++;
        } else if (model.isEdge(cell)) {
          edgeCount++;
        }
      }

      const info: DiagramInfo = {
        cellCount: cells.length,
        vertexCount,
        edgeCount,
        pageCount: ui && ui.pages ? ui.pages.length : 1,
        currentPageId: ui && ui.currentPage ? ui.currentPage.getId() : null,
      };

      return { success: true, data: info };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getPages(): APIResult<PageData[]> {
    try {
      const ui = this._api.editorUi as {
        pages?: Array<{ getId: () => string; getName: () => string }>;
      } | null;

      if (!ui) {
        return {
          success: true,
          data: [{ id: "1", name: "Page-1", index: 0 }],
        };
      }

      const pages = ui.pages || [];
      const pageData: PageData[] = pages.map((page, index) => ({
        id: page.getId(),
        name: page.getName(),
        index,
      }));

      return { success: true, data: pageData };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  addPage(name?: string): APIResult<PageData> {
    try {
      const ui = this._api.editorUi as {
        pages?: unknown[];
        insertPage?: (
          page: unknown,
          index: number,
        ) => { getId: () => string; setName: (name: string) => void };
      } | null;

      if (!ui || !ui.pages) {
        return { success: false, error: "Multi-page mode not available" };
      }

      const pageName = name || `Page-${ui.pages.length + 1}`;

      if (typeof ui.insertPage === "function") {
        const page = ui.insertPage(null, ui.pages.length);
        if (page) {
          page.setName(pageName);
          return {
            success: true,
            data: {
              id: page.getId(),
              name: pageName,
              index: ui.pages.length - 1,
            },
          };
        }
      }

      return { success: false, error: "Page creation not supported" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  removePage(pageId: string): APIResult {
    try {
      const ui = this._api.editorUi as {
        pages?: Array<{ getId: () => string }>;
        removePage?: (page: unknown) => void;
      } | null;

      if (!ui || !ui.pages) {
        return { success: false, error: "Multi-page mode not available" };
      }

      if (ui.pages.length <= 1) {
        return { success: false, error: "Cannot remove the last page" };
      }

      const pageIndex = ui.pages.findIndex((p) => p.getId() === pageId);
      if (pageIndex === -1) {
        return { success: false, error: "Page not found" };
      }

      if (typeof ui.removePage === "function") {
        ui.removePage(ui.pages[pageIndex]);
        return { success: true };
      }

      return { success: false, error: "Page removal not supported" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  selectPage(pageId: string): APIResult {
    try {
      const ui = this._api.editorUi as {
        pages?: Array<{ getId: () => string }>;
        selectPage?: (page: unknown) => void;
      } | null;

      if (!ui || !ui.pages) {
        return { success: false, error: "Multi-page mode not available" };
      }

      const page = ui.pages.find((p) => p.getId() === pageId);
      if (!page) {
        return { success: false, error: "Page not found" };
      }

      if (typeof ui.selectPage === "function") {
        ui.selectPage(page);
        return { success: true };
      }

      return { success: false, error: "Page selection not supported" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  undo(): APIResult {
    try {
      const ui = this._api.editorUi as {
        editor?: { undoManager?: { undo: () => void } };
      } | null;

      if (ui && ui.editor && ui.editor.undoManager) {
        ui.editor.undoManager.undo();
        return { success: true };
      }

      return { success: false, error: "Undo not available" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  redo(): APIResult {
    try {
      const ui = this._api.editorUi as {
        editor?: { undoManager?: { redo: () => void } };
      } | null;

      if (ui && ui.editor && ui.editor.undoManager) {
        ui.editor.undoManager.redo();
        return { success: true };
      }

      return { success: false, error: "Redo not available" };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  canUndo(): APIResult<boolean> {
    try {
      const ui = this._api.editorUi as {
        editor?: { undoManager?: { canUndo: () => boolean } };
      } | null;

      if (ui && ui.editor && ui.editor.undoManager) {
        return { success: true, data: ui.editor.undoManager.canUndo() };
      }

      return { success: true, data: false };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  canRedo(): APIResult<boolean> {
    try {
      const ui = this._api.editorUi as {
        editor?: { undoManager?: { canRedo: () => boolean } };
      } | null;

      if (ui && ui.editor && ui.editor.undoManager) {
        return { success: true, data: ui.editor.undoManager.canRedo() };
      }

      return { success: true, data: false };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  beginUpdate(): APIResult {
    try {
      const model = this._api.model as { beginUpdate: () => void } | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      model.beginUpdate();
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  endUpdate(): APIResult {
    try {
      const model = this._api.model as { endUpdate: () => void } | null;

      if (!model) {
        return { success: false, error: "API not initialized" };
      }

      model.endUpdate();
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
