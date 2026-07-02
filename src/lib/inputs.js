import { buildInputs } from "./config-builder.js";
import { readEnvValues } from "./env-inputs.js";

/**
 * @param {string} command
 * @returns {import('./types.js').AdoPlanConfig | import('@synatic/entity-sync-core').SyncConfig}
 */
export function parseInputs(command) {
  return buildInputs(command, readEnvValues(command));
}
