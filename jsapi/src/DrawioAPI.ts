// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file DrawioAPI.ts - Clean API Facade for draw.io
 * @description Provides programmatic control over draw.io diagrams.
 */

import { DiagramManager } from "./DiagramManager.js";
import { CellManager } from "./CellManager.js";
import { StyleManager } from "./StyleManager.js";
import { IOManager } from "./IOManager.js";
import { LibraryManager } from "./LibraryManager.js";
import type {
  APIResult,
  VertexOptions,
  EdgeOptions,
  DrawioAPIDependencies,
} from "./types.js";

/**
 * Factory function to create a DrawioAPI instance.
 */
export function createDrawioAPI(
  dependencies: DrawioAPIDependencies = {},
): DrawioAPI {
  return new DrawioAPI(dependencies);
}

/**
 * Main API class providing a facade over draw.io internals.
 */
export class DrawioAPI {
  private _graph: unknown;
  private _model: unknown;
  private _editorUi: unknown;

  public diagram: DiagramManager;
  public cells: CellManager;
  public styles: StyleManager;
  public io: IOManager;
  public libraries: LibraryManager;

  constructor(dependencies: DrawioAPIDependencies) {
    this._graph = dependencies.graph || null;
    this._model = dependencies.model || null;
    this._editorUi = dependencies.editorUi || null;

    // If graph is provided but model isn't, try to get model from graph
    if (
      this._graph &&
      !this._model &&
      typeof (this._graph as { getModel?: () => unknown }).getModel ===
        "function"
    ) {
      this._model = (this._graph as { getModel: () => unknown }).getModel();
    }

    this.diagram = new DiagramManager(this);
    this.cells = new CellManager(this);
    this.styles = new StyleManager(this);
    this.io = new IOManager(this);
    this.libraries = new LibraryManager(this);
  }

  /**
   * Initialize the API with an existing EditorUi instance.
   */
  init(editorUi: unknown): APIResult {
    try {
      if (!editorUi) {
        return { success: false, error: "EditorUi is required" };
      }

      this._editorUi = editorUi;

      const ui = editorUi as { editor?: { graph?: unknown } };
      if (ui.editor && ui.editor.graph) {
        this._graph = ui.editor.graph;
        this._model = (this._graph as { getModel: () => unknown }).getModel();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Check if the API is properly initialized.
   */
  isInitialized(): boolean {
    return this._graph !== null && this._model !== null;
  }

  get graph(): unknown {
    return this._graph;
  }

  get model(): unknown {
    return this._model;
  }

  get editorUi(): unknown {
    return this._editorUi;
  }

  setGraph(graph: unknown): void {
    this._graph = graph;
    if (
      graph &&
      typeof (graph as { getModel?: () => unknown }).getModel === "function"
    ) {
      this._model = (graph as { getModel: () => unknown }).getModel();
    }
  }

  setModel(model: unknown): void {
    this._model = model;
  }

  setEditorUi(editorUi: unknown): void {
    this._editorUi = editorUi;
  }

  getVersion(): APIResult<{ api: string; name: string }> {
    return {
      success: true,
      data: {
        api: "1.0.0",
        name: "DrawioAPI",
      },
    };
  }

  /**
   * Execute an operation within a transaction.
   */
  transaction<T>(fn: () => T): APIResult<T> {
    try {
      if (!this._model) {
        return { success: false, error: "API not initialized" };
      }

      const model = this._model as {
        beginUpdate: () => void;
        endUpdate: () => void;
      };
      model.beginUpdate();
      try {
        const result = fn();
        return result !== undefined
          ? (result as APIResult<T>)
          : { success: true };
      } finally {
        model.endUpdate();
      }
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  insertVertex(options: VertexOptions): APIResult<{ id: string }> {
    return this.cells.insertVertex(options);
  }

  insertEdge(options: EdgeOptions): APIResult<{ id: string }> {
    return this.cells.insertEdge(options);
  }

  createSvgDataUri(svgContent: string): string {
    return this.cells.createSvgDataUri(svgContent);
  }

  createImageDataUri(imageData: Buffer | string, mimeType?: string): string {
    return this.cells.createImageDataUri(imageData, mimeType);
  }

  insertImageVertex(options: {
    id?: string | null;
    label?: string;
    geometry: { x: number; y: number; width?: number; height?: number };
    imageDataUri: string;
    maintainAspect?: boolean;
    styleOverrides?: Record<string, string | number | undefined>;
  }): APIResult<{ id: string }> {
    return this.cells.insertImageVertex(options);
  }

  toXml(): APIResult<string> {
    return this.io.toXml();
  }

  fromXml(xml: string): APIResult {
    return this.io.fromXml(xml);
  }
}

// For non-module environments, expose on window
if (typeof window !== "undefined") {
  (
    window as unknown as { createDrawioAPI: typeof createDrawioAPI }
  ).createDrawioAPI = createDrawioAPI;
  (window as unknown as { DrawioAPI: typeof DrawioAPI }).DrawioAPI = DrawioAPI;
}
