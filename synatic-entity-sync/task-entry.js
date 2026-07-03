import * as tl from "azure-pipelines-task-lib/task";
import { buildInputs } from "../src/lib/config-builder.js";
import { readTaskValues } from "../src/lib/task-inputs.js";
import { runPlanCommand } from "../src/commands/plan.js";
import { runExecuteCommand } from "../src/commands/execute.js";
import { createTaskLogger } from "../src/lib/logging.js";

/**
 * @param {string} name
 * @param {string} value
 */
function setOutput(name, value) {
  if (value !== undefined && value !== null && value !== "") {
    tl.setVariable(name, String(value), false, true);
  }
}

async function run() {
  try {
    if (process.env.BUILD_SOURCESDIRECTORY) {
      process.env.ENTITY_SYNC_WORKSPACE = process.env.BUILD_SOURCESDIRECTORY;
    }

    const command = tl.getInput("command", true).toLowerCase();
    if (command !== "plan" && command !== "execute") {
      throw new Error(`Invalid command '${command}'. Must be 'plan' or 'execute'.`);
    }

    const reader = {
      getInput: (name, required) => tl.getInput(name, required),
      getBoolInput: (name, defaultValue) => tl.getBoolInput(name, defaultValue),
    };

    const inputs = buildInputs(command, readTaskValues(command, reader));
    const logger = createTaskLogger(tl);

    if (command === "plan") {
      const result = await runPlanCommand(inputs, { logger });
      setOutput("planId", result.plan.planId);
      setOutput("planPath", result.planPath);
      setOutput("branchName", result.branchName);
      setOutput("commitSha", result.commitSha);
      tl.setResult(tl.TaskResult.Succeeded, "Entity sync plan completed");
      return;
    }

    const result = await runExecuteCommand(inputs, { logger });
    setOutput("planId", result.planId);
    setOutput("planPath", result.planPath);
    if (result.conflicts !== undefined) {
      setOutput("conflicts", String(result.conflicts));
    }
    if (result.previewSummary) {
      setOutput("summary", JSON.stringify(result.previewSummary));
    }
    if (result.executeSummary) {
      setOutput("summary", JSON.stringify(result.executeSummary));
    }
    setOutput("runId", result.runId || "");
    tl.setResult(tl.TaskResult.Succeeded, "Entity sync execute completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    tl.setResult(tl.TaskResult.Failed, message);
  }
}

run();
