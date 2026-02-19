// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file MockModel.ts - Mock implementation of mxGraphModel
 * @description Provides a testable mock of mxGraphModel for unit testing
 */

export interface MockCellInterface {
  id: string;
  children: MockCellInterface[];
  parent: MockCellInterface | null;
  value: string | null;
  geometry: MockGeometryInterface | null;
  style: string | null;
  vertex: boolean;
  edge: boolean;
  source: MockCellInterface | null;
  target: MockCellInterface | null;
  getId(): string;
  getValue(): string | null;
  setValue(v: string | null): void;
  getParent(): MockCellInterface | null;
  getGeometry(): MockGeometryInterface | null;
  setGeometry(g: MockGeometryInterface | null): void;
  getStyle(): string;
  setStyle(s: string): void;
  getChildCount(): number;
  getChildAt(i: number): MockCellInterface | null;
}

export interface MockGeometryInterface {
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Array<{ x: number; y: number }>;
  clone(): MockGeometryInterface;
}

export class MockModel {
  private _nextId: number = 2;
  private _updateLevel: number = 0;
  private _cells: Map<string, MockCellInterface> = new Map();
  private _root: MockCellInterface;
  private _defaultParent: MockCellInterface;

  constructor() {
    this._root = this._createRootCell();
    this._defaultParent = this._createDefaultParent();

    this._root.children.push(this._defaultParent);
    this._cells.set("0", this._root);
    this._cells.set("1", this._defaultParent);
  }

  private _createRootCell(): MockCellInterface {
    const cell: MockCellInterface = {
      id: "0",
      children: [],
      parent: null,
      value: null,
      geometry: null,
      style: null,
      vertex: false,
      edge: false,
      source: null,
      target: null,
      getId: () => "0",
      getValue: () => null,
      setValue: () => {},
      getParent: () => null,
      getGeometry: () => null,
      setGeometry: () => {},
      getStyle: () => "",
      setStyle: () => {},
      getChildCount: function () {
        return this.children.length;
      },
      getChildAt: function (i) {
        return this.children[i] || null;
      },
    };
    return cell;
  }

  private _createDefaultParent(): MockCellInterface {
    const cell: MockCellInterface = {
      id: "1",
      children: [],
      parent: this._root,
      value: null,
      geometry: null,
      style: null,
      vertex: false,
      edge: false,
      source: null,
      target: null,
      getId: () => "1",
      getValue: () => null,
      setValue: () => {},
      getParent: () => this._root,
      getGeometry: () => null,
      setGeometry: () => {},
      getStyle: () => "",
      setStyle: () => {},
      getChildCount: function () {
        return this.children.length;
      },
      getChildAt: function (i) {
        return this.children[i] || null;
      },
    };
    return cell;
  }

  getRoot(): MockCellInterface {
    return this._root;
  }

  setRoot(root: MockCellInterface): void {
    this._root = root;
    this._cells.clear();
    this._cells.set(root.id || root.getId(), root);
    if (root.children) {
      for (const child of root.children) {
        this._cells.set(child.id || child.getId(), child);
      }
    }
  }

  getCell(id: string): MockCellInterface | null {
    return this._cells.get(id) || null;
  }

  getChildren(cell: MockCellInterface | null): MockCellInterface[] {
    if (!cell) return [];
    return cell.children ? [...cell.children] : [];
  }

  isVertex(cell: unknown): boolean {
    return (
      cell !== null &&
      typeof cell === "object" &&
      (cell as MockCellInterface).vertex === true
    );
  }

  isEdge(cell: unknown): boolean {
    return (
      cell !== null &&
      typeof cell === "object" &&
      (cell as MockCellInterface).edge === true
    );
  }

  beginUpdate(): void {
    this._updateLevel++;
  }

  endUpdate(): void {
    this._updateLevel--;
  }

  getUpdateLevel(): number {
    return this._updateLevel;
  }

  clear(): void {
    this._defaultParent.children = [];
    this._cells.clear();
    this._cells.set("0", this._root);
    this._cells.set("1", this._defaultParent);
    this._nextId = 2;
  }

  add(
    parent: MockCellInterface,
    cell: MockCellInterface,
    index?: number,
  ): MockCellInterface {
    if (!cell.id) {
      cell.id = String(this._nextId++);
    }
    cell.parent = parent;
    if (!parent.children) {
      parent.children = [];
    }
    if (typeof index === "number") {
      parent.children.splice(index, 0, cell);
    } else {
      parent.children.push(cell);
    }
    this._cells.set(cell.id, cell);
    return cell;
  }

  remove(cell: MockCellInterface): MockCellInterface {
    if (cell.parent && cell.parent.children) {
      const index = cell.parent.children.indexOf(cell);
      if (index >= 0) {
        cell.parent.children.splice(index, 1);
      }
    }
    this._cells.delete(cell.id);
    return cell;
  }

  setValue(cell: MockCellInterface, value: string): void {
    if (cell) {
      cell.value = value;
    }
  }

  setGeometry(cell: MockCellInterface, geometry: MockGeometryInterface): void {
    if (cell) {
      cell.geometry = geometry;
    }
  }

  setStyle(cell: MockCellInterface, style: string): void {
    if (cell) {
      cell.style = style;
    }
  }

  getNextId(): string {
    return String(this._nextId++);
  }
}
