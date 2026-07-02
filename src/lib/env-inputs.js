/**
 * @param {string} name
 * @param {{ required?: boolean, defaultValue?: string }} [options]
 * @returns {string}
 */
function getEnv(name, options = {}) {
  const value = (process.env[name] || options.defaultValue || "").trim();
  if (options.required && !value) {
    throw new Error(`Environment variable '${name}' is required`);
  }
  return value;
}

/**
 * @param {string} command
 * @returns {Record<string, unknown>}
 */
export function readEnvValues(command) {
  const normalizedCommand = command.toLowerCase();

  /** @type {Record<string, unknown>} */
  const values = {
    apiUrl: getEnv("SYNATIC_API_URL", { required: true }),
    apiKey: getEnv("SYNATIC_API_KEY", { required: true }),
    sourceOrgId: getEnv("SOURCE_ORG_ID"),
    rootType: getEnv("ROOT_TYPE"),
    rootId: getEnv("ROOT_ID"),
    roots: getEnv("ROOTS"),
    planPath: getEnv("PLAN_PATH"),
    planOptions: getEnv("PLAN_OPTIONS") || "{}",
    destOrgId: getEnv("DEST_ORG_ID"),
    previewFirst: process.env.PREVIEW_FIRST,
    previewOnly: process.env.PREVIEW_ONLY,
    failOnConflict: process.env.FAIL_ON_CONFLICT,
  };

  if (normalizedCommand === "plan") {
    values.autoCommit = process.env.AUTO_COMMIT;
    values.createPr = process.env.CREATE_PR;
    values.prTitle = getEnv("PR_TITLE");
    values.prBody = getEnv("PR_BODY");
    values.prBaseBranch = getEnv("PR_BASE_BRANCH") || "main";
    values.commitMessage =
      getEnv("COMMIT_MESSAGE") || "chore: update entity sync plan";
  }

  return values;
}
