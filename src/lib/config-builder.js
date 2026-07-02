import { parseConfig } from "@synatic/entity-sync-core";

/**
 * @param {unknown} value
 * @param {boolean} [defaultValue=false]
 * @returns {boolean}
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true";
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isTruthyDefaultTrue(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true";
}

/**
 * @param {string} command
 * @param {Record<string, unknown>} values
 * @returns {import('./types.js').AdoPlanConfig | import('@synatic/entity-sync-core').SyncConfig}
 */
export function buildInputs(command, values) {
  const normalizedCommand = command.toLowerCase();
  const config = parseConfig(normalizedCommand, values);

  if (normalizedCommand === "plan") {
    return {
      ...config,
      autoCommit: isTruthyDefaultTrue(values.autoCommit),
      createPr: isTruthyDefaultTrue(values.createPr),
      prTitle: typeof values.prTitle === "string" ? values.prTitle : "",
      prBody: typeof values.prBody === "string" ? values.prBody : "",
      prBaseBranch:
        (typeof values.prBaseBranch === "string" && values.prBaseBranch) ||
        "main",
      commitMessage:
        (typeof values.commitMessage === "string" && values.commitMessage) ||
        "chore: update entity sync plan",
    };
  }

  return config;
}

export { parseBoolean, isTruthyDefaultTrue };
