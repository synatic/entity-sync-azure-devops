import { createBranchName, runPlan } from "@synatic/entity-sync-core";
import { AzureReposGit } from "../lib/azure-repos-git.js";
import { getAzureContext } from "../lib/azure-context.js";
import { createConsoleLogger } from "../lib/logging.js";

/**
 * @param {import('../lib/types.js').AdoPlanConfig} inputs
 * @param {{ logger?: import('@synatic/entity-sync-core').SyncLogger }} [options]
 * @returns {Promise<import('../lib/types.js').PlanCommandResult>}
 */
export async function runPlanCommand(inputs, options = {}) {
  const logger = options.logger || createConsoleLogger();
  const result = await runPlan(inputs, { logger });

  logger.info(`Plan ${result.plan.planId} written to ${result.planPath}`);

  /** @type {import('../lib/types.js').PlanCommandResult} */
  const commandResult = {
    plan: result.plan,
    planPath: result.planPath,
  };

  if (!inputs.autoCommit) {
    logger.info("auto-commit is false; plan file written locally only");
    return commandResult;
  }

  const context = getAzureContext();
  const git = new AzureReposGit(context);
  const branchName = createBranchName();

  const prTitle =
    inputs.prTitle || `Entity sync plan ${result.plan.planId.slice(0, 8)}`;
  const prBody =
    inputs.prBody ||
    [
      "Automated entity sync plan update.",
      "",
      `- Plan ID: ${result.plan.planId}`,
      `- Source org ID: ${inputs.sourceOrgId}`,
      inputs.roots
        ? `- Roots: ${inputs.roots.map((r) => `${r.rootType} ${r.rootId}`).join(", ")}`
        : `- Root: ${inputs.rootType} ${inputs.rootId}`,
      `- Generated: ${result.plan.generatedAt}`,
    ].join("\n");

  const commitResult = await git.commitFiles({
    files: result.writtenFiles,
    branchName,
    baseBranch: inputs.prBaseBranch || "main",
    commitMessage: inputs.commitMessage || "chore: update entity sync plan",
    createPr: inputs.createPr ?? true,
    prTitle,
    prBody,
  });

  logger.info(
    inputs.createPr
      ? `Created branch ${commitResult.branchName} and opened pull request`
      : `Committed plan to branch ${commitResult.branchName}`
  );

  commandResult.branchName = commitResult.branchName;
  commandResult.commitSha = commitResult.commitSha;
  return commandResult;
}
