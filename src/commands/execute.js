import { runExecute } from "@synatic/entity-sync-core";
import { createConsoleLogger } from "../lib/logging.js";

/**
 * @param {import('@synatic/entity-sync-core').SyncConfig} inputs
 * @param {{ logger?: import('@synatic/entity-sync-core').SyncLogger }} [options]
 * @returns {Promise<import('../lib/types.js').ExecuteCommandResult>}
 */
export async function runExecuteCommand(inputs, options = {}) {
  const logger = options.logger || createConsoleLogger();
  const result = await runExecute(inputs, { logger });

  /** @type {import('../lib/types.js').ExecuteCommandResult} */
  return {
    planId: result.planId,
    planPath: result.planPath,
    conflicts: result.conflicts,
    previewSummary: result.preview?.summary,
    runId: result.runId,
    executeSummary: result.execute?.summary,
  };
}
