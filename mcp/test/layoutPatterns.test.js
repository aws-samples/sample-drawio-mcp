// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { describe, it, expect } from "vitest";
import * as layoutPatterns from "../src/utils/layoutPatterns.js";

describe("layoutPatterns", () => {
  describe("gridToPixels", () => {
    it("should convert grid coordinates to pixels", () => {
      const result = layoutPatterns.gridToPixels(3, 2, 100, 50);
      expect(result).toEqual({ x: 350, y: 250 });
    });
  });

  describe("generateSingleCenterLayout", () => {
    it("should generate single-center layout", () => {
      const elements = [
        { id: "center" },
        { id: "sat1" },
        { id: "sat2" },
        { id: "sat3" },
      ];

      const result = layoutPatterns.generateSingleCenterLayout(elements);

      expect(result.pattern).toBe("single-center");
      expect(result.coordinates).toHaveLength(4);
      expect(result.coordinates[0].role).toBe("center");
      expect(result.connections).toHaveLength(3);
    });

    it("should throw error with no elements", () => {
      expect(() => {
        layoutPatterns.generateSingleCenterLayout([]);
      }).toThrow();
    });
  });

  describe("generateDualCenterLayout", () => {
    it("should generate dual-center layout", () => {
      const elements = [
        { id: "left" },
        { id: "right" },
        { id: "sat1" },
        { id: "sat2" },
      ];

      const result = layoutPatterns.generateDualCenterLayout(elements);

      expect(result.pattern).toBe("dual-center");
      expect(result.coordinates).toHaveLength(4);
      expect(result.connections.length).toBeGreaterThan(0);
    });
  });

  describe("generateLinearLayout", () => {
    it("should generate horizontal linear layout", () => {
      const elements = [{ id: "step1" }, { id: "step2" }, { id: "step3" }];

      const result = layoutPatterns.generateLinearLayout(elements, {
        direction: "horizontal",
      });

      expect(result.pattern).toBe("linear");
      expect(result.direction).toBe("horizontal");
      expect(result.coordinates).toHaveLength(3);
      expect(result.connections).toHaveLength(2);
    });
  });

  describe("selectPattern", () => {
    it("should select linear for small count with 1 main group", () => {
      expect(layoutPatterns.selectPattern(5, false, 1)).toBe("linear");
    });

    it("should select dual-center for 2 main groups", () => {
      expect(layoutPatterns.selectPattern(5, false, 2)).toBe("dual-center");
    });

    it("should select tree for hierarchical", () => {
      expect(layoutPatterns.selectPattern(10, true, 1)).toBe("tree");
    });

    it("should select grid for many elements", () => {
      expect(layoutPatterns.selectPattern(20, false, 1)).toBe("grid");
    });
  });
});
