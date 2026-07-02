import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { parseInputs } from "../src/lib/inputs.js";

describe("parseInputs", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SYNATIC_API_URL = "https://api.example.com/";
    process.env.SYNATIC_API_KEY = "syn_api_test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("parses plan command environment variables", () => {
    process.env.SOURCE_ORG_ID = "60ff27eab96f22106d98f1f2";
    process.env.ROOT_TYPE = "flow";
    process.env.ROOT_ID = "507f1f77bcf86cd799439011";
    process.env.AUTO_COMMIT = "false";
    process.env.CREATE_PR = "false";

    const inputs = parseInputs("plan");

    expect(inputs.command).toBe("plan");
    expect(inputs.apiUrl).toBe("https://api.example.com");
    expect(inputs.autoCommit).toBe(false);
    expect(inputs.createPr).toBe(false);
  });

  it("parses execute command environment variables", () => {
    process.env.DEST_ORG_ID = "507f1f77bcf86cd799439012";

    const inputs = parseInputs("execute");

    expect(inputs.command).toBe("execute");
    expect(inputs.destOrgId).toBe("507f1f77bcf86cd799439012");
    expect(inputs.previewFirst).toBe(true);
    expect(inputs.failOnConflict).toBe(true);
  });
});
