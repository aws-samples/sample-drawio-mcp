// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file types.ts - TypeScript type definitions for DrawioAPI
 * @description Central type definitions for the draw.io API
 */

// =============================================================================
// GEOMETRY TYPES
// =============================================================================

/**
 * Represents a 2D point.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents cell geometry (position and size).
 */
export interface CellGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Partial geometry for updates.
 */
export interface PartialGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// =============================================================================
// STYLE TYPES
// =============================================================================

/**
 * Style properties that can be applied to cells.
 */
export interface CellStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number | string;
  fontColor?: string;
  fontSize?: number | string;
  fontFamily?: string;
  opacity?: number | string;
  rounded?: string | number;
  shadow?: string | number;
  shape?: string;
  perimeter?: string;
  verticalAlign?: string;
  align?: string;
  spacingTop?: number | string;
  spacingBottom?: number | string;
  spacingLeft?: number | string;
  spacingRight?: number | string;
  dashed?: string | number;
  dashPattern?: string;
  gradientColor?: string;
  gradientDirection?: string;
  glass?: string | number;
  labelBackgroundColor?: string;
  labelBorderColor?: string;
  [key: string]: string | number | undefined;
}

// =============================================================================
// API RESULT TYPES
// =============================================================================

/**
 * Standard API result type with success/error pattern.
 */
export interface APIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// CELL TYPES
// =============================================================================

/**
 * Data representation of a cell.
 */
export interface CellData {
  id: string;
  label: string;
  style: string;
  isVertex: boolean;
  isEdge: boolean;
  parentId: string | null;
  geometry?: CellGeometry;
  sourceId?: string | null;
  targetId?: string | null;
}

/**
 * Options for inserting a vertex.
 */
export interface VertexOptions {
  id?: string | null;
  label?: string;
  geometry: CellGeometry;
  style?: string | CellStyle;
  parentId?: string;
}

/**
 * Options for inserting an edge.
 */
export interface EdgeOptions {
  id?: string | null;
  label?: string;
  sourceId: string;
  targetId: string;
  style?: string | CellStyle;
  waypoints?: Point[];
}

/**
 * Options for updating a cell.
 */
export interface UpdateCellOptions {
  label?: string;
  geometry?: PartialGeometry;
  style?: string | CellStyle;
}

// =============================================================================
// DIAGRAM TYPES
// =============================================================================

/**
 * Information about a diagram.
 */
export interface DiagramInfo {
  cellCount: number;
  vertexCount: number;
  edgeCount: number;
  pageCount: number;
  currentPageId: string | null;
}

/**
 * Page data.
 */
export interface PageData {
  id: string;
  name: string;
  index: number;
}

// =============================================================================
// LIBRARY TYPES
// =============================================================================

/**
 * Icon definition from a shape library.
 */
export interface IconDefinition {
  name: string;
  icon: string;
  fillColor?: string;
  width?: number;
  height?: number;
  category?: string;
}

/**
 * Group definition from a shape library.
 */
export interface GroupDefinition {
  name: string;
  simple?: boolean;
  strokeColor?: string;
  fillColor?: string;
  fontColor?: string;
  icon?: string;
}

/**
 * Library information.
 */
export interface LibraryInfo {
  id: string;
  name: string;
  categories: string[];
  groupTypes?: string[];
}

// =============================================================================
// AWS4 TYPES
// =============================================================================

/**
 * Options for inserting an AWS icon.
 */
export interface AwsIconOptions {
  icon?: string;
  style?: string;
  label?: string;
  geometry: PartialGeometry & { x: number; y: number };
  category?: string;
  fillColor?: string;
  id?: string;
  parentId?: string;
}

/**
 * Options for inserting an AWS group.
 */
export interface AwsGroupOptions {
  groupType?: string;
  style?: string;
  label?: string;
  geometry: CellGeometry;
  strokeColor?: string;
  fillColor?: string;
  fontColor?: string;
  id?: string;
  parentId?: string;
}

/**
 * AWS group type info.
 */
export interface AwsGroupTypeInfo {
  type: string;
  name: string;
  hasIcon: boolean;
}

// =============================================================================
// MXGRAPH MOCK TYPES
// =============================================================================

/**
 * Mock cell interface (represents mxCell).
 */
export interface MockCell {
  id: string;
  value: string | null;
  geometry: MockGeometry | null;
  style: string;
  vertex: boolean;
  edge: boolean;
  parent: MockCell | null;
  children: MockCell[];
  source: MockCell | null;
  target: MockCell | null;
  getId(): string;
  getValue(): string | null;
  setValue(v: string | null): void;
  getGeometry(): MockGeometry | null;
  setGeometry(g: MockGeometry | null): void;
  getStyle(): string;
  setStyle(s: string): void;
  getParent(): MockCell | null;
  getChildCount(): number;
  getChildAt(i: number): MockCell | null;
}

/**
 * Mock geometry interface.
 */
export interface MockGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  clone(): MockGeometry;
}

// =============================================================================
// ENGINE TYPES
// =============================================================================

/**
 * Options for creating a diagram.
 */
export interface CreateDiagramOptions {
  name?: string;
}

/**
 * Options for serializing a diagram to XML.
 */
export interface SerializeOptions {
  diagramName?: string;
  wrapInMxFile?: boolean;
}

/**
 * Parse result from XmlParser.
 */
export interface ParseResult {
  diagramName?: string;
  pageCount?: number;
}

// =============================================================================
// EXPORT OPTIONS TYPES
// =============================================================================

/**
 * SVG export options.
 */
export interface SvgExportOptions {
  border?: number;
  background?: string | null;
}

/**
 * PNG export options.
 */
export interface PngExportOptions {
  scale?: number;
  background?: string | null;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * XML validation result.
 */
export interface XmlValidationResult {
  valid: boolean;
  error?: string;
  rootElement?: string;
}

// =============================================================================
// STYLE BUILDER OPTIONS
// =============================================================================

/**
 * Options for building icon styles.
 */
export interface IconStyleOptions {
  fillColor?: string;
  category?: string;
  type?: "resource" | "product";
}

/**
 * Options for building group styles.
 */
export interface GroupStyleOptions {
  strokeColor?: string;
  fillColor?: string;
  fontColor?: string;
}

// =============================================================================
// DEPENDENCY INJECTION TYPES
// =============================================================================

/**
 * Dependencies for DrawioAPI constructor.
 */
export interface DrawioAPIDependencies {
  graph?: unknown;
  model?: unknown;
  editorUi?: unknown;
}

// =============================================================================
// LEGACY TYPES EXPORT (for compatibility)
// =============================================================================

/**
 * Types namespace for backwards compatibility.
 */
export const Types = {
  // This object exists for backwards compatibility with JS imports
};
