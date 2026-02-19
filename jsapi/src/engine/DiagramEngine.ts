// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file DiagramEngine.ts - Wrapper around DrawioAPI
 * @description Manages DrawioAPI lifecycle and provides enhanced XML I/O.
 */

import { readFileSync, writeFileSync } from "fs";
import { createDrawioAPI, DrawioAPI } from "../DrawioAPI.js";
import { MockGraph } from "../mocks/MockGraph.js";
import { MockModel } from "../mocks/MockModel.js";
import { XmlSerializer } from "./XmlSerializer.js";
import { XmlParser } from "./XmlParser.js";
import type {
  APIResult,
  CreateDiagramOptions,
  SerializeOptions,
} from "../types.js";

interface Logger {
  info: (msg: string, data?: unknown) => void;
  error: (msg: string, data?: unknown) => void;
}

const logger: Logger = {
  info: (msg, data) => {
    if (process.env.DEBUG) console.log("[INFO]", msg, data ?? "");
  },
  error: (msg, data) => {
    console.error("[ERROR]", msg, data ?? "");
  },
};

export class DiagramEngine {
  private _model: MockModel | null = null;
  private _graph: MockGraph | null = null;
  private _api: DrawioAPI | null = null;
  private _filePath: string | null = null;
  private _diagramName: string = "Page-1";
  private _serializer: XmlSerializer;
  private _parser: XmlParser;

  constructor() {
    this._serializer = new XmlSerializer();
    this._parser = new XmlParser();
  }

  create(
    options: CreateDiagramOptions = {},
  ): APIResult<{ name: string; isNew: boolean }> {
    try {
      this._model = new MockModel();
      this._graph = new MockGraph(this._model);
      this._api = createDrawioAPI({ graph: this._graph, model: this._model });
      this._filePath = null;
      this._diagramName = options.name || "Page-1";

      logger.info("Created new diagram", { name: this._diagramName });

      return {
        success: true,
        data: {
          name: this._diagramName,
          isNew: true,
        },
      };
    } catch (e) {
      logger.error("Failed to create diagram", { error: (e as Error).message });
      return { success: false, error: (e as Error).message };
    }
  }

  loadFromXml(
    xml: string,
  ): APIResult<{ diagramName?: string; pageCount?: number }> {
    try {
      this._model = new MockModel();
      this._graph = new MockGraph(this._model);
      this._api = createDrawioAPI({ graph: this._graph, model: this._model });

      const result = this._parser.parse(xml, this._api);

      if (result.success && result.data) {
        this._diagramName = result.data.diagramName || "Page-1";
      }

      if (result.success) {
        logger.info("Loaded diagram from XML", { name: this._diagramName });
      }

      return result;
    } catch (e) {
      logger.error("Failed to load diagram from XML", {
        error: (e as Error).message,
      });
      return { success: false, error: (e as Error).message };
    }
  }

  loadFromFile(
    filePath: string,
  ): APIResult<{ diagramName?: string; pageCount?: number }> {
    try {
      const xml = readFileSync(filePath, "utf8");
      const result = this.loadFromXml(xml);

      if (result.success) {
        this._filePath = filePath;
        logger.info("Loaded diagram from file", {
          path: filePath,
          name: this._diagramName,
        });
      }

      return result;
    } catch (e) {
      logger.error("Failed to load diagram from file", {
        path: filePath,
        error: (e as Error).message,
      });
      return {
        success: false,
        error: `Failed to read file: ${(e as Error).message}`,
      };
    }
  }

  toXml(options: SerializeOptions = {}): APIResult<string> {
    if (!this._api) {
      return { success: false, error: "No diagram loaded" };
    }

    return this._serializer.serialize(this._api, {
      diagramName: options.diagramName || this._diagramName,
      wrapInMxFile: options.wrapInMxFile,
    });
  }

  saveToFile(
    filePath?: string,
    options: SerializeOptions = {},
  ): APIResult<{ path: string; name: string }> {
    const targetPath = filePath || this._filePath;

    if (!targetPath) {
      return { success: false, error: "No file path specified" };
    }

    const xmlResult = this.toXml(options);
    if (!xmlResult.success || !xmlResult.data) {
      return {
        success: false,
        error: xmlResult.error || "Failed to serialize XML",
      };
    }

    try {
      writeFileSync(targetPath, xmlResult.data, "utf8");
      this._filePath = targetPath;

      logger.info("Saved diagram to file", { path: targetPath });

      return {
        success: true,
        data: {
          path: targetPath,
          name: options.diagramName || this._diagramName,
        },
      };
    } catch (e) {
      logger.error("Failed to save diagram to file", {
        path: targetPath,
        error: (e as Error).message,
      });
      return {
        success: false,
        error: `Failed to write file: ${(e as Error).message}`,
      };
    }
  }

  getInfo(): APIResult<{
    name: string;
    filePath: string | null;
    cellCount?: number;
    vertexCount?: number;
    edgeCount?: number;
  }> {
    if (!this._api) {
      return { success: false, error: "No diagram loaded" };
    }

    const info = this._api.diagram.getInfo();

    return {
      success: true,
      data: {
        name: this._diagramName,
        filePath: this._filePath,
        ...info.data,
      },
    };
  }

  clear(): APIResult {
    if (!this._api) {
      return { success: false, error: "No diagram loaded" };
    }

    const result = this._api.diagram.clear();
    if (result.success) {
      logger.info("Cleared diagram");
    }
    return result;
  }

  get isLoaded(): boolean {
    return this._api !== null;
  }

  get api(): DrawioAPI | null {
    return this._api;
  }

  get filePath(): string | null {
    return this._filePath;
  }

  get diagramName(): string {
    return this._diagramName;
  }

  set diagramName(name: string) {
    this._diagramName = name;
  }
}
