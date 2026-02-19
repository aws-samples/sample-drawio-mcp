// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file MockEditorUi.ts - Mock implementation of EditorUi
 * @description Provides a testable mock of EditorUi for unit testing
 */

import { MockGraph } from "./MockGraph.js";

export class MockPage {
  private _id: string;
  private _name: string;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }
}

export class MockUndoManager {
  private _history: unknown[] = [];
  private _index: number = -1;

  undo(): void {
    if (this._index >= 0) {
      this._index--;
    }
  }

  redo(): void {
    if (this._index < this._history.length - 1) {
      this._index++;
    }
  }

  canUndo(): boolean {
    return this._index >= 0;
  }

  canRedo(): boolean {
    return this._index < this._history.length - 1;
  }

  add(edit: unknown): void {
    this._history = this._history.slice(0, this._index + 1);
    this._history.push(edit);
    this._index = this._history.length - 1;
  }
}

export class MockEditorUi {
  private _graph: MockGraph;
  public editor: {
    graph: MockGraph;
    undoManager: MockUndoManager;
  };
  public pages: MockPage[];
  public currentPage: MockPage;

  constructor(graph?: MockGraph) {
    this._graph = graph || new MockGraph();

    this.editor = {
      graph: this._graph,
      undoManager: new MockUndoManager(),
    };

    this.pages = [new MockPage("page-1", "Page-1")];
    this.currentPage = this.pages[0];
  }

  get graph(): MockGraph {
    return this._graph;
  }

  insertPage(page: MockPage | null, index?: number): MockPage {
    const newPage =
      page ||
      new MockPage(
        `page-${this.pages.length + 1}`,
        `Page-${this.pages.length + 1}`,
      );
    if (typeof index === "number") {
      this.pages.splice(index, 0, newPage);
    } else {
      this.pages.push(newPage);
    }
    return newPage;
  }

  removePage(page: MockPage): void {
    const index = this.pages.indexOf(page);
    if (index >= 0) {
      this.pages.splice(index, 1);
      if (this.currentPage === page && this.pages.length > 0) {
        this.currentPage = this.pages[0];
      }
    }
  }

  selectPage(page: MockPage): void {
    if (this.pages.includes(page)) {
      this.currentPage = page;
    }
  }

  getFileData(compressed: boolean): string {
    const xml = "<mxfile><diagram>mock</diagram></mxfile>";
    return compressed ? xml : xml;
  }

  setFileData(_data: string): void {
    // Mock implementation - just accept the data
  }
}
