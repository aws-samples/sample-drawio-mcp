// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file logger.js - Logging utility for MCP server
 * @description Provides logging to stderr (to not interfere with stdio transport)
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

let currentLevel = LOG_LEVELS.INFO;

/**
 * Set the logging level.
 * @param {'DEBUG' | 'INFO' | 'WARN' | 'ERROR'} level - Log level
 */
export function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLevel = LOG_LEVELS[level];
  }
}

/**
 * Format a log message with timestamp.
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data to include
 * @returns {string} Formatted message
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  let msg = `[${timestamp}] [${level}] ${message}`;
  if (data !== undefined) {
    msg += ` ${JSON.stringify(data)}`;
  }
  return msg;
}

/**
 * Log a debug message.
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data
 */
export function debug(message, data) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.error(formatMessage("DEBUG", message, data));
  }
}

/**
 * Log an info message.
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data
 */
export function info(message, data) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.error(formatMessage("INFO", message, data));
  }
}

/**
 * Log a warning message.
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data
 */
export function warn(message, data) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.error(formatMessage("WARN", message, data));
  }
}

/**
 * Log an error message.
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data
 */
export function error(message, data) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(formatMessage("ERROR", message, data));
  }
}
