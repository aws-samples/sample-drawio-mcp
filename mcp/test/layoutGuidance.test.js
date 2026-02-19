// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { describe, it, expect } from "vitest";
import {
  getLayoutGuidance,
  getLayoutGuidanceText,
} from "../src/utils/layoutGuidance.js";

describe("layoutGuidance", () => {
  describe("getLayoutGuidance", () => {
    it("should return structured guidance object", () => {
      const guidance = getLayoutGuidance();

      expect(guidance).toHaveProperty("summary");
      expect(guidance).toHaveProperty("principles");
      expect(guidance).toHaveProperty("gridSystem");
      expect(guidance).toHaveProperty("patterns");
      expect(guidance).toHaveProperty("tools");
      expect(guidance).toHaveProperty("workflow");

      expect(guidance.principles).toBeInstanceOf(Array);
      expect(guidance.principles.length).toBeGreaterThan(0);

      expect(guidance.patterns).toHaveProperty("single-center");
      expect(guidance.patterns).toHaveProperty("dual-center");
      expect(guidance.patterns).toHaveProperty("triangle");
      expect(guidance.patterns).toHaveProperty("linear");
      expect(guidance.patterns).toHaveProperty("tree");
      expect(guidance.patterns).toHaveProperty("grid");
    });
  });

  describe("getLayoutGuidanceText", () => {
    it("should return formatted text guidance", () => {
      const text = getLayoutGuidanceText();

      expect(typeof text).toBe("string");
      expect(text).toContain("Layout Guidance");
      expect(text).toContain("Key Principles");
      expect(text).toContain("Grid System");
      expect(text).toContain("Layout Patterns");
      expect(text).toContain("Available Tools");
      expect(text).toContain("Workflow");
      expect(text).toContain("Decision Tree");
    });

    it("should include all patterns in text", () => {
      const text = getLayoutGuidanceText();

      expect(text).toContain("Single Center");
      expect(text).toContain("Dual Centers");
      expect(text).toContain("Triangle");
      expect(text).toContain("Linear Flow");
      expect(text).toContain("Hierarchical Tree");
      expect(text).toContain("Grid Layout");
    });
  });
});
