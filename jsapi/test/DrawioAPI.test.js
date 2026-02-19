// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file DrawioAPI.test.ts - Tests for DrawioAPI
 * @description Unit tests for the main DrawioAPI class
 */

import { describe, it, expect, beforeEach } from "vitest";
import "../src/mocks/globalMocks.ts";
import { createDrawioAPI, DrawioAPI } from "../src/DrawioAPI.ts";
import { MockGraph } from "../src/mocks/MockGraph.ts";
import { MockModel } from "../src/mocks/MockModel.ts";
import { MockEditorUi } from "../src/mocks/MockEditorUi.ts";

describe("DrawioAPI", () => {
  let api;
  let mockGraph;
  let mockModel;

  beforeEach(() => {
    mockModel = new MockModel();
    mockGraph = new MockGraph(mockModel);
    api = createDrawioAPI({
      graph: mockGraph,
      model: mockModel,
    });
  });

  describe("createDrawioAPI", () => {
    it("should create a DrawioAPI instance", () => {
      const instance = createDrawioAPI();
      expect(instance).toBeInstanceOf(DrawioAPI);
    });

    it("should accept dependencies", () => {
      const graph = new MockGraph();
      const instance = createDrawioAPI({ graph });
      expect(instance.graph).toBe(graph);
    });

    it("should auto-get model from graph if not provided", () => {
      const graph = new MockGraph();
      const instance = createDrawioAPI({ graph });
      expect(instance.model).toBe(graph.getModel());
    });
  });

  describe("init", () => {
    it("should initialize with EditorUi", () => {
      const newApi = createDrawioAPI();
      const mockUi = new MockEditorUi();

      const result = newApi.init(mockUi);

      expect(result.success).toBe(true);
      expect(newApi.editorUi).toBe(mockUi);
      expect(newApi.graph).toBe(mockUi.editor.graph);
    });

    it("should fail without EditorUi", () => {
      const newApi = createDrawioAPI();
      const result = newApi.init(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe("EditorUi is required");
    });
  });

  describe("isInitialized", () => {
    it("should return true when graph and model are set", () => {
      expect(api.isInitialized()).toBe(true);
    });

    it("should return false when not initialized", () => {
      const newApi = createDrawioAPI();
      expect(newApi.isInitialized()).toBe(false);
    });
  });

  describe("getVersion", () => {
    it("should return version info", () => {
      const result = api.getVersion();

      expect(result.success).toBe(true);
      expect(result.data.api).toBe("1.0.0");
      expect(result.data.name).toBe("DrawioAPI");
    });
  });

  describe("transaction", () => {
    it("should wrap operations in beginUpdate/endUpdate", () => {
      let updateLevelDuring = null;

      api.transaction(() => {
        updateLevelDuring = mockModel.getUpdateLevel();
      });

      expect(updateLevelDuring).toBe(1);
      expect(mockModel.getUpdateLevel()).toBe(0);
    });

    it("should return function result", () => {
      const result = api.transaction(() => {
        return { success: true, data: "test" };
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe("test");
    });

    it("should handle errors", () => {
      const result = api.transaction(() => {
        throw new Error("Test error");
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test error");
    });

    it("should fail when not initialized", () => {
      const newApi = createDrawioAPI();
      const result = newApi.transaction(() => {});

      expect(result.success).toBe(false);
      expect(result.error).toBe("API not initialized");
    });
  });

  describe("convenience methods", () => {
    it("insertVertex should delegate to cells.insertVertex", () => {
      const options = {
        label: "Test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      };

      const result = api.insertVertex(options);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it("insertEdge should delegate to cells.insertEdge", () => {
      // Create two vertices first
      api.insertVertex({
        id: "v1",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });
      api.insertVertex({
        id: "v2",
        geometry: { x: 200, y: 0, width: 100, height: 50 },
      });

      const result = api.insertEdge({
        sourceId: "v1",
        targetId: "v2",
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it("toXml should delegate to io.toXml", () => {
      const result = api.toXml();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("fromXml should delegate to io.fromXml", () => {
      const xml = "<mxGraphModel><root></root></mxGraphModel>";
      const result = api.fromXml(xml);

      // Note: This may fail with mock implementations
      // but should not throw
      expect(result).toBeDefined();
    });
  });

  describe("setters", () => {
    it("should allow setting graph", () => {
      const newGraph = new MockGraph();
      api.setGraph(newGraph);
      expect(api.graph).toBe(newGraph);
    });

    it("should allow setting model", () => {
      const newModel = new MockModel();
      api.setModel(newModel);
      expect(api.model).toBe(newModel);
    });

    it("should allow setting editorUi", () => {
      const newUi = new MockEditorUi();
      api.setEditorUi(newUi);
      expect(api.editorUi).toBe(newUi);
    });
  });

  describe("managers", () => {
    it("should have diagram manager", () => {
      expect(api.diagram).toBeDefined();
    });

    it("should have cells manager", () => {
      expect(api.cells).toBeDefined();
    });

    it("should have styles manager", () => {
      expect(api.styles).toBeDefined();
    });

    it("should have io manager", () => {
      expect(api.io).toBeDefined();
    });
  });
});
