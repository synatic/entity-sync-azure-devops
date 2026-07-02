import { describe, expect, it } from "vitest";
import { readTaskValues } from "../src/lib/task-inputs.js";
import { buildInputs } from "../src/lib/config-builder.js";

describe("readTaskValues", () => {
  it("maps plan task inputs to config values", () => {
    const reader = {
      getInput: (name) => {
        const values = {
          apiUrl: "https://api.example.com/",
          apiKey: "syn_api_test",
          sourceOrgId: "60ff27eab96f22106d98f1f2",
          rootType: "flow",
          rootId: "507f1f77bcf86cd799439011",
          planPath: ".synatic/plans/flow.json",
          planOptions: "{}",
        };
        return values[name];
      },
      getBoolInput: (name, defaultValue) => {
        if (name === "autoCommit" || name === "createPr") {
          return false;
        }
        return defaultValue;
      },
    };

    const inputs = buildInputs("plan", readTaskValues("plan", reader));

    expect(inputs.command).toBe("plan");
    expect(inputs.apiUrl).toBe("https://api.example.com");
    expect(inputs.autoCommit).toBe(false);
    expect(inputs.createPr).toBe(false);
  });

  it("maps execute task inputs with boolean defaults", () => {
    const reader = {
      getInput: (name) => {
        const values = {
          apiUrl: "https://api.example.com",
          apiKey: "syn_api_test",
          destOrgId: "507f1f77bcf86cd799439012",
          planPath: ".synatic/plans/plan.json",
        };
        return values[name];
      },
      getBoolInput: (_name, defaultValue) => defaultValue,
    };

    const inputs = buildInputs("execute", readTaskValues("execute", reader));

    expect(inputs.command).toBe("execute");
    expect(inputs.previewFirst).toBe(true);
    expect(inputs.failOnConflict).toBe(true);
    expect(inputs.previewOnly).toBe(false);
  });
});
