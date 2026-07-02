/**
 * @typedef {Object} AzureContext
 * @property {string} collectionUri
 * @property {string} project
 * @property {string} repoId
 * @property {string} accessToken
 * @property {string} workspace
 */

/**
 * @typedef {import('@synatic/entity-sync-core').SyncConfig & {
 *   autoCommit?: boolean,
 *   createPr?: boolean,
 *   prTitle?: string,
 *   prBody?: string,
 *   prBaseBranch?: string,
 *   commitMessage?: string,
 * }} AdoPlanConfig
 */

/**
 * @typedef {Object} PlanCommandResult
 * @property {import('@synatic/entity-sync-core').SyncPlan} plan
 * @property {string} planPath
 * @property {string} [branchName]
 * @property {string} [commitSha]
 */

/**
 * @typedef {Object} ExecuteCommandResult
 * @property {string} planId
 * @property {string} planPath
 * @property {number} [conflicts]
 * @property {Record<string, unknown>} [previewSummary]
 * @property {string} [runId]
 * @property {Record<string, unknown>} [executeSummary]
 */
