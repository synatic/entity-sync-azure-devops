/**
 * @typedef {Object} TaskInputReader
 * @property {(name: string, required?: boolean) => string | undefined} getInput
 * @property {(name: string, defaultValue?: boolean) => boolean} getBoolInput
 */

/**
 * @param {string} command
 * @param {TaskInputReader} reader
 * @returns {Record<string, unknown>}
 */
export function readTaskValues(command, reader) {
  const normalizedCommand = command.toLowerCase();

  /** @type {Record<string, unknown>} */
  const values = {
    apiUrl: reader.getInput("apiUrl", true),
    apiKey: reader.getInput("apiKey", true),
    sourceOrgId: reader.getInput("sourceOrgId"),
    rootType: reader.getInput("rootType"),
    rootId: reader.getInput("rootId"),
    roots: reader.getInput("roots"),
    planPath: reader.getInput("planPath"),
    planOptions: reader.getInput("planOptions") || "{}",
    destOrgId: reader.getInput("destOrgId"),
    previewFirst: reader.getInput("previewFirst"),
    previewOnly: reader.getInput("previewOnly"),
    failOnConflict: reader.getInput("failOnConflict"),
  };

  if (normalizedCommand === "plan") {
    values.autoCommit = reader.getBoolInput("autoCommit", true);
    values.createPr = reader.getBoolInput("createPr", true);
    values.prTitle = reader.getInput("prTitle");
    values.prBody = reader.getInput("prBody");
    values.prBaseBranch = reader.getInput("prBaseBranch") || "main";
    values.commitMessage =
      reader.getInput("commitMessage") || "chore: update entity sync plan";
  }

  if (normalizedCommand === "execute") {
    values.previewFirst = reader.getBoolInput("previewFirst", true);
    values.previewOnly = reader.getBoolInput("previewOnly", false);
    values.failOnConflict = reader.getBoolInput("failOnConflict", true);
  }

  return values;
}
