// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file engine.test.ts - Tests for DiagramEngine
 */

import { describe, it, expect, beforeEach } from "vitest";
import { DiagramEngine } from "../src/engine/DiagramEngine.ts";
import "../src/mocks/globalMocks.ts";

describe("DiagramEngine", () => {
  let engine;

  beforeEach(() => {
    engine = new DiagramEngine();
  });

  describe("create", () => {
    it("should create a new diagram", () => {
      const result = engine.create();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Page-1");
      expect(result.data.isNew).toBe(true);
      expect(engine.isLoaded).toBe(true);
    });

    it("should create a diagram with custom name", () => {
      const result = engine.create({ name: "My Diagram" });
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("My Diagram");
    });
  });

  describe("toXml", () => {
    it("should return error if no diagram loaded", () => {
      const result = engine.toXml();
      expect(result.success).toBe(false);
      expect(result.error).toBe("No diagram loaded");
    });

    it("should serialize an empty diagram", () => {
      engine.create();
      const result = engine.toXml();
      expect(result.success).toBe(true);
      expect(result.data).toContain("<mxfile");
      expect(result.data).toContain("<mxGraphModel");
    });
  });

  describe("getInfo", () => {
    it("should return error if no diagram loaded", () => {
      const result = engine.getInfo();
      expect(result.success).toBe(false);
    });

    it("should return diagram info", () => {
      engine.create({ name: "Test Diagram" });
      const result = engine.getInfo();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Test Diagram");
    });
  });

  describe("clear", () => {
    it("should return error if no diagram loaded", () => {
      const result = engine.clear();
      expect(result.success).toBe(false);
    });

    it("should clear the diagram", () => {
      engine.create();
      // Add a cell
      engine.api.cells.insertVertex({
        id: "test-1",
        label: "Test",
        geometry: { x: 0, y: 0, width: 100, height: 50 },
      });

      const result = engine.clear();
      expect(result.success).toBe(true);
    });
  });

  describe("api access", () => {
    it("should provide access to DrawioAPI", () => {
      engine.create();
      expect(engine.api).not.toBeNull();
      expect(engine.api.cells).toBeDefined();
      expect(engine.api.styles).toBeDefined();
    });

    it("should allow inserting vertices", () => {
      engine.create();
      const result = engine.api.cells.insertVertex({
        id: "v1",
        label: "Test Vertex",
        geometry: { x: 100, y: 100, width: 120, height: 60 },
      });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe("v1");
    });

    it("should allow inserting edges", () => {
      engine.create();

      // Create two vertices
      engine.api.cells.insertVertex({
        id: "v1",
        label: "Source",
        geometry: { x: 100, y: 100, width: 100, height: 50 },
      });

      engine.api.cells.insertVertex({
        id: "v2",
        label: "Target",
        geometry: { x: 300, y: 100, width: 100, height: 50 },
      });

      // Create edge
      const result = engine.api.cells.insertEdge({
        id: "e1",
        sourceId: "v1",
        targetId: "v2",
        label: "Connection",
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("e1");
    });
  });

  describe("XML serialization roundtrip", () => {
    it("should serialize and preserve vertices", () => {
      engine.create({ name: "Test" });

      engine.api.cells.insertVertex({
        id: "rect-1",
        label: "Rectangle",
        geometry: { x: 50, y: 50, width: 120, height: 60 },
        style: { fillColor: "#FF0000" },
      });

      const xmlResult = engine.toXml();
      expect(xmlResult.success).toBe(true);
      expect(xmlResult.data).toContain("rect-1");
      expect(xmlResult.data).toContain("Rectangle");
    });
  });
});
