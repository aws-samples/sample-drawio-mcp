// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file index.ts - AWS4 module exports
 * @description Central export point for AWS4 style utilities
 */

export {
  // Type definitions
  type AWS4IconDefinition,
  type AWS4IconLookupResult,
  type AWS4GroupDefinition,
  type ResourceIconStyleOptions,
  type ProductIconStyleOptions,
  type GroupStyleOptions,
  type StyleObject,
  type AWS4IconCategory,

  // Base style patterns
  AWS4_BASE,
  AWS4_COLORS,

  // Icon and group catalogs
  AWS4_ICONS,
  AWS4_GROUPS,

  // Style builder functions
  buildResourceIconStyle,
  buildProductIconStyle,
  buildGroupStyle,

  // Lookup utilities
  findIcon,
  getCategories,
  getIconsByCategory,
  getGroupTypes,

  // Style string utilities
  parseStyleString,
  buildStyleString,
} from "./AWS4Styles.js";
