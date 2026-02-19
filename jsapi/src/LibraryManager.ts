// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file LibraryManager.ts - Shape library management
 * @description Manages shape libraries (AWS4, Azure, GCP, etc.)
 */

import type { DrawioAPI } from "./DrawioAPI.js";
import type {
  APIResult,
  IconDefinition,
  LibraryInfo,
  IconStyleOptions,
  GroupStyleOptions,
} from "./types.js";
import {
  AWS4_ICONS,
  AWS4_GROUPS,
  AWS4_COLORS,
  buildResourceIconStyle,
  buildProductIconStyle,
  buildGroupStyle,
  findIcon as findAws4Icon,
  getCategories as getAws4Categories,
  getIconsByCategory as getAws4IconsByCategory,
  getGroupTypes as getAws4GroupTypes,
  parseStyleString,
  buildStyleString,
} from "./stencils/aws4/index.js";

export const LIBRARIES = {
  AWS4: "aws4",
} as const;

type LibraryId = (typeof LIBRARIES)[keyof typeof LIBRARIES];

interface LibraryDefinition {
  name: string;
  icons: Record<string, Record<string, IconDefinition>>;
  groups: Record<string, { name: string; simple?: boolean }>;
  colors: Record<string, string>;
  findIcon: (name: string, category?: string) => IconDefinition | null;
  getCategories: () => string[];
  getIconsByCategory: (
    category: string,
  ) => Record<string, IconDefinition> | null;
  getGroupTypes: () => string[];
  buildResourceIconStyle: (
    icon: string,
    options?: { fillColor?: string },
  ) => string;
  buildProductIconStyle: (
    icon: string,
    options?: { fillColor?: string },
  ) => string;
  buildGroupStyle: (groupType: string, options?: GroupStyleOptions) => string;
}

export class LibraryManager {
  private _api: DrawioAPI;
  private _libraries: Record<LibraryId, LibraryDefinition>;

  constructor(api: DrawioAPI) {
    this._api = api;

    this._libraries = {
      [LIBRARIES.AWS4]: {
        name: "AWS Architecture Icons (AWS4)",
        icons: AWS4_ICONS,
        groups: AWS4_GROUPS,
        colors: AWS4_COLORS,
        findIcon: findAws4Icon,
        getCategories: getAws4Categories,
        getIconsByCategory: getAws4IconsByCategory,
        getGroupTypes: getAws4GroupTypes,
        buildResourceIconStyle,
        buildProductIconStyle,
        buildGroupStyle,
      },
    };
  }

  getAvailableLibraries(): APIResult<LibraryInfo[]> {
    try {
      const libraries = Object.entries(this._libraries).map(([id, lib]) => ({
        id,
        name: lib.name,
        categories: lib.getCategories(),
      }));
      return { success: true, data: libraries };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getLibraryInfo(libraryId: string): APIResult<LibraryInfo> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      return {
        success: true,
        data: {
          id: libraryId,
          name: lib.name,
          categories: lib.getCategories(),
          groupTypes: lib.getGroupTypes(),
        },
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  findIcon(
    libraryId: string,
    iconName: string,
    category?: string,
  ): APIResult<IconDefinition> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      const icon = lib.findIcon(iconName, category);
      if (!icon) {
        return { success: false, error: `Icon not found: ${iconName}` };
      }

      return { success: true, data: icon };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getIconsByCategory(
    libraryId: string,
    category: string,
  ): APIResult<Record<string, IconDefinition>> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      const icons = lib.getIconsByCategory(category);
      if (!icons) {
        return { success: false, error: `Unknown category: ${category}` };
      }

      return { success: true, data: icons };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getCategories(libraryId: string): APIResult<string[]> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      return { success: true, data: lib.getCategories() };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getGroupTypes(libraryId: string): APIResult<string[]> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      return { success: true, data: lib.getGroupTypes() };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  buildIconStyle(
    libraryId: string,
    iconName: string,
    options: IconStyleOptions = {},
  ): APIResult<string> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      const icon = lib.findIcon(iconName, options.category);
      const fillColor =
        options.fillColor || (icon ? icon.fillColor : undefined);

      const type = options.type || "resource";
      let style: string;

      if (type === "product") {
        style = lib.buildProductIconStyle(icon ? icon.icon : iconName, {
          fillColor,
        });
      } else {
        style = lib.buildResourceIconStyle(icon ? icon.icon : iconName, {
          fillColor,
        });
      }

      return { success: true, data: style };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  buildGroupStyle(
    libraryId: string,
    groupType: string,
    options: GroupStyleOptions = {},
  ): APIResult<string> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      const style = lib.buildGroupStyle(groupType, options);
      return { success: true, data: style };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  parseStyle(styleString: string): APIResult<Record<string, string>> {
    try {
      const parsed = parseStyleString(styleString);
      // Filter out undefined values
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined) {
          result[key] = String(value);
        }
      }
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  buildStyle(styleObj: Record<string, string | number>): APIResult<string> {
    try {
      const result = buildStyleString(
        styleObj as Record<string, string | number | undefined>,
      );
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getColors(libraryId: string): APIResult<Record<string, string>> {
    try {
      const lib = this._libraries[libraryId as LibraryId];
      if (!lib) {
        return { success: false, error: `Unknown library: ${libraryId}` };
      }

      return { success: true, data: lib.colors || {} };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  // AWS4 convenience methods
  getAwsIcon(iconName: string, category?: string): APIResult<IconDefinition> {
    return this.findIcon(LIBRARIES.AWS4, iconName, category);
  }

  buildAwsIconStyle(
    iconName: string,
    options: IconStyleOptions = {},
  ): APIResult<string> {
    return this.buildIconStyle(LIBRARIES.AWS4, iconName, options);
  }

  buildAwsGroupStyle(
    groupType: string,
    options: GroupStyleOptions = {},
  ): APIResult<string> {
    return this.buildGroupStyle(LIBRARIES.AWS4, groupType, options);
  }
}
