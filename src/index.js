#!/usr/bin/env node
import { buildInputs } from "./lib/config-builder.js";
import { readEnvValues } from "./lib/env-inputs.js";
import { runPlanCommand } from "./commands/plan.js";
import { runExecuteCommand } from "./commands/execute.js";
import { createConsoleLogger } from "./lib/logging.js";

async function main() {
  const [, , commandArg] = process.argv;
  const command = (
    commandArg ||
    process.env.ENTITY_SYNC_COMMAND ||
    ""
  ).toLowerCase();

  if (command !== "plan" && command !== "execute") {
    console.error("Usage: entity-sync-ado <plan|execute>");
    console.error("");
    console.error("Configure Synatic and Azure settings via environment variables.");
    console.error("For Azure Pipelines, install the Synatic Entity Sync extension task.");
    process.exit(1);
  }

  if (process.env.BUILD_SOURCESDIRECTORY) {
    process.env.ENTITY_SYNC_WORKSPACE = process.env.BUILD_SOURCESDIRECTORY;
  }

  const inputs = buildInputs(command, readEnvValues(command));
  const logger = createConsoleLogger();

  if (command === "plan") {
    const result = await runPlanCommand(inputs, { logger });
    console.log(`plan-id=${result.plan.planId}`);
    console.log(`plan-path=${result.planPath}`);
    if (result.branchName) {
      console.log(`branch-name=${result.branchName}`);
    }
    return;
  }

  const result = await runExecuteCommand(inputs, { logger });
  console.log(`plan-id=${result.planId}`);
  console.log(`plan-path=${result.planPath}`);
  if (result.conflicts !== undefined) {
    console.log(`conflicts=${result.conflicts}`);
  }
  if (result.runId) {
    console.log(`run-id=${result.runId}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
