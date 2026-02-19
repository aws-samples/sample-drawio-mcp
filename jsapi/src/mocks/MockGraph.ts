// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file MockGraph.ts - Mock implementation of mxGraph
 * @description Provides a testable mock of mxGraph for unit testing
 */

import { MockModel, MockCellInterface } from "./MockModel.js";

interface MockStylesheet {
  getDefaultVertexStyle(): Record<string, unknown>;
  getDefaultEdgeStyle(): Record<string, unknown>;
}

interface MockGraphView {
  getState(cell: MockCellInterface): { style?: Record<string, unknown> } | null;
  setState(cell: MockCellInterface, state: unknown): void;
}

class MockStylesheetImpl implements MockStylesheet {
  private _defaultVertexStyle: Record<string, unknown> = {};
  private _defaultEdgeStyle: Record<string, unknown> = {};

  getDefaultVertexStyle(): Record<string, unknown> {
    return this._defaultVertexStyle;
  }

  getDefaultEdgeStyle(): Record<string, unknown> {
    return this._defaultEdgeStyle;
  }
}

class MockGraphViewImpl implements MockGraphView {
  private _graph: MockGraph;
  private _states: Map<string, unknown> = new Map();

  constructor(graph: MockGraph) {
    this._graph = graph;
  }

  getState(
    cell: MockCellInterface,
  ): { style?: Record<string, unknown> } | null {
    if (!cell) return null;
    return (
      (this._states.get(cell.id) as { style?: Record<string, unknown> }) || null
    );
  }

  setState(cell: MockCellInterface, state: unknown): void {
    if (cell) {
      this._states.set(cell.id, state);
    }
  }
}

export class MockGraph {
  private _model: MockModel;
  private _selection: MockCellInterface[] = [];
  private _stylesheet: MockStylesheet;
  private _view: MockGraphView;

  constructor(model?: MockModel) {
    this._model = model || new MockModel();
    this._stylesheet = new MockStylesheetImpl();
    this._view = new MockGraphViewImpl(this);
  }

  getModel(): MockModel {
    return this._model;
  }

  getDefaultParent(): MockCellInterface {
    return this._model.getCell("1")!;
  }

  insertVertex(
    parent: MockCellInterface,
    id: string | null,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number,
    style?: string,
  ): MockCellInterface {
    const cell = this._createCell(id, value, true, false);
    cell.geometry = {
      x: x || 0,
      y: y || 0,
      width: width || 0,
      height: height || 0,
      clone: function () {
        return { ...this };
      },
    };
    cell.style = style || "";
    this._model.add(parent || this.getDefaultParent(), cell);
    return cell;
  }

  insertEdge(
    parent: MockCellInterface,
    id: string | null,
    value: string,
    source: MockCellInterface,
    target: MockCellInterface,
    style?: string,
  ): MockCellInterface {
    const cell = this._createCell(id, value, false, true);
    cell.source = source;
    cell.target = target;
    cell.style = style || "";
    cell.geometry = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      points: [],
      clone: function () {
        return { ...this, points: [...(this.points || [])] };
      },
    };
    this._model.add(parent || this.getDefaultParent(), cell);
    return cell;
  }

  private _createCell(
    id: string | null,
    value: string,
    vertex: boolean,
    edge: boolean,
  ): MockCellInterface {
    const cellId = id || this._model.getNextId();
    const cell: MockCellInterface = {
      id: cellId,
      value: value,
      geometry: null,
      style: "",
      vertex: vertex,
      edge: edge,
      parent: null,
      children: [],
      source: null,
      target: null,
      getId: function () {
        return this.id;
      },
      getValue: function () {
        return this.value;
      },
      setValue: function (v) {
        this.value = v;
      },
      getGeometry: function () {
        return this.geometry;
      },
      setGeometry: function (g) {
        this.geometry = g;
      },
      getStyle: function () {
        return this.style || "";
      },
      setStyle: function (s) {
        this.style = s;
      },
      getParent: function () {
        return this.parent;
      },
      getChildCount: function () {
        return this.children ? this.children.length : 0;
      },
      getChildAt: function (i) {
        return this.children ? this.children[i] : null;
      },
    };
    return cell;
  }

  removeCells(cells: MockCellInterface[]): MockCellInterface[] {
    if (!cells) return [];
    for (const cell of cells) {
      if (cell.parent && cell.parent.children) {
        const index = cell.parent.children.indexOf(cell);
        if (index >= 0) {
          cell.parent.children.splice(index, 1);
        }
      }
      this._model.remove(cell);
    }
    return cells;
  }

  cloneCells(cells: MockCellInterface[]): MockCellInterface[] {
    if (!cells) return [];
    return cells.map((cell) => {
      const clone = this._createCell(
        null,
        cell.value || "",
        cell.vertex,
        cell.edge,
      );
      if (cell.geometry) {
        clone.geometry = { ...cell.geometry, clone: cell.geometry.clone };
      }
      clone.style = cell.style;
      return clone;
    });
  }

  addCells(
    cells: MockCellInterface[],
    parent: MockCellInterface,
  ): MockCellInterface[] {
    if (!cells) return [];
    const targetParent = parent || this.getDefaultParent();
    for (const cell of cells) {
      this._model.add(targetParent, cell);
    }
    return cells;
  }

  groupCells(
    group: MockCellInterface | null,
    border: number,
    cells: MockCellInterface[],
  ): MockCellInterface {
    if (!cells || cells.length === 0) {
      throw new Error("No cells to group");
    }

    const groupCell = group || this._createCell(null, "", true, false);
    groupCell.geometry = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      clone: function () {
        return { ...this };
      },
    };
    this._model.add(this.getDefaultParent(), groupCell);

    for (const cell of cells) {
      if (cell.parent && cell.parent.children) {
        const index = cell.parent.children.indexOf(cell);
        if (index >= 0) {
          cell.parent.children.splice(index, 1);
        }
      }
      cell.parent = groupCell;
      groupCell.children.push(cell);
    }

    return groupCell;
  }

  ungroupCells(groups: MockCellInterface[]): MockCellInterface[] {
    if (!groups) return [];
    const released: MockCellInterface[] = [];
    const defaultParent = this.getDefaultParent();

    for (const group of groups) {
      if (group.children) {
        for (const child of [...group.children]) {
          child.parent = defaultParent;
          defaultParent.children.push(child);
          released.push(child);
        }
        group.children = [];
      }
      this._model.remove(group);
    }

    return released;
  }

  getEdges(
    cell: MockCellInterface,
    parent: MockCellInterface | null,
    incoming: boolean,
    outgoing: boolean,
  ): MockCellInterface[] {
    const edges: MockCellInterface[] = [];
    const searchParent = parent || this.getDefaultParent();

    if (searchParent.children) {
      for (const child of searchParent.children) {
        if (child.edge) {
          if (incoming && child.target === cell) {
            edges.push(child);
          }
          if (outgoing && child.source === cell) {
            edges.push(child);
          }
        }
      }
    }

    return edges;
  }

  getGraphBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    const parent = this.getDefaultParent();
    if (!parent.children || parent.children.length === 0) {
      return null;
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const cell of parent.children) {
      if (cell.geometry && cell.vertex) {
        const geo = cell.geometry;
        minX = Math.min(minX, geo.x);
        minY = Math.min(minY, geo.y);
        maxX = Math.max(maxX, geo.x + geo.width);
        maxY = Math.max(maxY, geo.y + geo.height);
      }
    }

    if (minX === Infinity) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  getSelectionCells(): MockCellInterface[] {
    return this._selection;
  }

  setSelectionCells(cells: MockCellInterface[]): void {
    this._selection = cells || [];
  }

  clearSelection(): void {
    this._selection = [];
  }

  getStylesheet(): MockStylesheet {
    return this._stylesheet;
  }

  getView(): MockGraphView {
    return this._view;
  }

  getSvg(): SVGElement | null {
    if (typeof document !== "undefined") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100");
      svg.setAttribute("height", "100");
      return svg;
    }
    return null;
  }
}
