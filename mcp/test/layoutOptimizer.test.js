// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { describe, it, expect } from "vitest";
import * as layoutOptimizer from "../src/utils/layoutOptimizer.js";

describe("layoutOptimizer", () => {
  describe("detectOverlaps", () => {
    it("should detect overlapping cells", () => {
      const cells = [
        { id: "a", geometry: { x: 0, y: 0, width: 100, height: 50 } },
        { id: "b", geometry: { x: 50, y: 25, width: 100, height: 50 } },
      ];

      const overlaps = layoutOptimizer.detectOverlaps(cells);

      expect(overlaps).toHaveLength(1);
      expect(overlaps[0].cell1).toBe("a");
      expect(overlaps[0].cell2).toBe("b");
      expect(overlaps[0].overlap).toBeGreaterThan(0);
    });

    it("should not detect non-overlapping cells", () => {
      const cells = [
        { id: "a", geometry: { x: 0, y: 0, width: 100, height: 50 } },
        { id: "b", geometry: { x: 200, y: 200, width: 100, height: 50 } },
      ];

      const overlaps = layoutOptimizer.detectOverlaps(cells);

      expect(overlaps).toHaveLength(0);
    });
  });

  describe("resolveOverlaps", () => {
    it("should generate adjustments for overlapping cells", () => {
      const cells = [
        { id: "a", geometry: { x: 0, y: 0, width: 100, height: 50 } },
        { id: "b", geometry: { x: 50, y: 25, width: 100, height: 50 } },
      ];

      const adjustments = layoutOptimizer.resolveOverlaps(cells, 20);

      expect(adjustments.length).toBeGreaterThan(0);
      expect(adjustments[0]).toHaveProperty("cellId");
      expect(adjustments[0]).toHaveProperty("newX");
      expect(adjustments[0]).toHaveProperty("newY");
    });
  });

  describe("analyzeSpacing", () => {
    it("should calculate spacing statistics", () => {
      const cells = [
        { id: "a", geometry: { x: 0, y: 0, width: 100, height: 50 } },
        { id: "b", geometry: { x: 200, y: 0, width: 100, height: 50 } },
        { id: "c", geometry: { x: 400, y: 0, width: 100, height: 50 } },
      ];

      const stats = layoutOptimizer.analyzeSpacing(cells);

      expect(stats).toHaveProperty("average");
      expect(stats).toHaveProperty("min");
      expect(stats).toHaveProperty("max");
      expect(stats).toHaveProperty("variance");
      expect(stats.average).toBeGreaterThan(0);
    });
  });

  describe("balanceLayout", () => {
    it("should generate balance adjustments", () => {
      const cells = [
        { id: "a", geometry: { x: 0, y: 0, width: 100, height: 50 } },
        { id: "b", geometry: { x: 500, y: 0, width: 100, height: 50 } },
        { id: "c", geometry: { x: 250, y: 500, width: 100, height: 50 } },
      ];

      const adjustments = layoutOptimizer.balanceLayout(cells, 150);

      expect(adjustments).toHaveLength(3);
      adjustments.forEach((adj) => {
        expect(adj).toHaveProperty("cellId");
        expect(adj).toHaveProperty("newX");
        expect(adj).toHaveProperty("newY");
      });
    });
  });
});
