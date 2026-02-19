// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file index.ts - Module exports for DrawioAPI
 * @description Central export point for the draw.io API
 */

export { createDrawioAPI, DrawioAPI } from "./DrawioAPI.js";
export { DiagramManager } from "./DiagramManager.js";
export { CellManager } from "./CellManager.js";
export { StyleManager } from "./StyleManager.js";
export { IOManager } from "./IOManager.js";
export { LibraryManager, LIBRARIES } from "./LibraryManager.js";
export { Types } from "./types.js";

// Type exports
export type {
  APIResult,
  CellGeometry,
  CellStyle,
  CellData,
  VertexOptions,
  EdgeOptions,
  UpdateCellOptions,
  DiagramInfo,
  PageData,
  Point,
  PartialGeometry,
  IconDefinition,
  GroupDefinition,
  LibraryInfo,
  AwsIconOptions,
  AwsGroupOptions,
  AwsGroupTypeInfo,
  CreateDiagramOptions,
  SerializeOptions,
  ParseResult,
  SvgExportOptions,
  PngExportOptions,
  XmlValidationResult,
  IconStyleOptions,
  GroupStyleOptions,
  DrawioAPIDependencies,
  MockCell,
  MockGeometry,
} from "./types.js";

// Engine exports
export { DiagramEngine, XmlParser, XmlSerializer } from "./engine/index.js";

// Mock exports for Node.js usage
export { setupGlobalMocks } from "./mocks/globalMocks.js";
export { MockModel } from "./mocks/MockModel.js";
export { MockGraph } from "./mocks/MockGraph.js";
export {
  MockEditorUi,
  MockPage,
  MockUndoManager,
} from "./mocks/MockEditorUi.js";

// AWS4 exports for direct access
export {
  AWS4_BASE,
  AWS4_COLORS,
  AWS4_ICONS,
  AWS4_GROUPS,
  buildResourceIconStyle,
  buildProductIconStyle,
  buildGroupStyle,
  findIcon,
  getCategories,
  getIconsByCategory,
  getGroupTypes,
  parseStyleString,
  buildStyleString,
} from "./stencils/aws4/index.js";
