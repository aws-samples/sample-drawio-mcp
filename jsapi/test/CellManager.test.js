// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file CellManager.test.ts - Tests for CellManager
 * @description Unit tests for the CellManager class
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createDrawioAPI } from "../src/DrawioAPI.ts";
import { MockGraph } from "../src/mocks/MockGraph.ts";
import { MockModel } from "../src/mocks/MockModel.ts";

describe("CellManager", () => {
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

  describe("insertVertex", () => {
    it("should create vertex with specified geometry", () => {
      const result = api.cells.insertVertex({
        label: "Test",
        geometry: { x: 100, y: 100, width: 80, height: 40 },
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it("should use provided ID when specified", () => {
      const result = api.cells.insertVertex({
        id: "custom-id",
        label: "Test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("custom-id");
    });

    it("should apply style", () => {
      const result = api.cells.insertVertex({
        label: "Styled",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
        style: { fillColor: "#ff0000", strokeColor: "#000000" },
      });

      expect(result.success).toBe(true);

      const cell = mockModel.getCell(result.data.id);
      expect(cell.style).toContain("fillColor=#ff0000");
      expect(cell.style).toContain("strokeColor=#000000");
    });

    it("should fail without geometry", () => {
      const result = api.cells.insertVertex({
        label: "No Geometry",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Geometry is required");
    });

    it("should fail when not initialized", () => {
      const newApi = createDrawioAPI();
      const result = newApi.cells.insertVertex({
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("API not initialized");
    });
  });

  describe("insertEdge", () => {
    let v1Id, v2Id;

    beforeEach(() => {
      const r1 = api.cells.insertVertex({
        id: "v1",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });
      const r2 = api.cells.insertVertex({
        id: "v2",
        geometry: { x: 200, y: 0, width: 100, height: 50 },
      });
      v1Id = r1.data.id;
      v2Id = r2.data.id;
    });

    it("should connect two vertices", () => {
      const result = api.cells.insertEdge({
        sourceId: v1Id,
        targetId: v2Id,
        label: "connects",
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it("should use provided ID", () => {
      const result = api.cells.insertEdge({
        id: "edge-1",
        sourceId: v1Id,
        targetId: v2Id,
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("edge-1");
    });

    it("should fail without source", () => {
      const result = api.cells.insertEdge({
        targetId: v2Id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Source and target IDs are required");
    });

    it("should fail with invalid source", () => {
      const result = api.cells.insertEdge({
        sourceId: "nonexistent",
        targetId: v2Id,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Source cell not found");
    });
  });

  describe("removeCell", () => {
    it("should remove a cell", () => {
      const {
        data: { id },
      } = api.cells.insertVertex({
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = api.cells.removeCell(id);

      expect(result.success).toBe(true);
      expect(mockModel.getCell(id)).toBeNull();
    });

    it("should fail for nonexistent cell", () => {
      const result = api.cells.removeCell("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cell not found");
    });
  });

  describe("getCell", () => {
    it("should return cell data", () => {
      api.cells.insertVertex({
        id: "test-cell",
        label: "Test Label",
        geometry: { x: 10, y: 20, width: 100, height: 50 },
      });

      const result = api.cells.getCell("test-cell");

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("test-cell");
      expect(result.data.label).toBe("Test Label");
      expect(result.data.isVertex).toBe(true);
      expect(result.data.geometry.x).toBe(10);
    });

    it("should fail for nonexistent cell", () => {
      const result = api.cells.getCell("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cell not found");
    });
  });

  describe("updateCell", () => {
    it("should update label", () => {
      api.cells.insertVertex({
        id: "test",
        label: "Original",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = api.cells.updateCell("test", { label: "Updated" });

      expect(result.success).toBe(true);

      const cell = api.cells.getCell("test");
      expect(cell.data.label).toBe("Updated");
    });

    it("should update geometry", () => {
      api.cells.insertVertex({
        id: "test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = api.cells.updateCell("test", {
        geometry: { x: 50, y: 50 },
      });

      expect(result.success).toBe(true);

      const cell = api.cells.getCell("test");
      expect(cell.data.geometry.x).toBe(50);
      expect(cell.data.geometry.y).toBe(50);
    });
  });

  describe("moveCell", () => {
    it("should move cell to new position", () => {
      api.cells.insertVertex({
        id: "test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = api.cells.moveCell("test", 100, 200);

      expect(result.success).toBe(true);

      const cell = api.cells.getCell("test");
      expect(cell.data.geometry.x).toBe(100);
      expect(cell.data.geometry.y).toBe(200);
    });
  });

  describe("resizeCell", () => {
    it("should resize cell", () => {
      api.cells.insertVertex({
        id: "test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = api.cells.resizeCell("test", 200, 100);

      expect(result.success).toBe(true);

      const cell = api.cells.getCell("test");
      expect(cell.data.geometry.width).toBe(200);
      expect(cell.data.geometry.height).toBe(100);
    });
  });
});
