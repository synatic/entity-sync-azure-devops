import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const gotMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("got", () => ({
  default: {
    extend: vi.fn(() => gotMocks),
  },
}));

import { AzureReposGit } from "../src/lib/azure-repos-git.js";

const context = {
  collectionUri: "https://dev.azure.com/agencyfuse/",
  project: "entity-sync-test",
  repoId: "repo-guid",
  accessToken: "token",
  workspace: "/tmp/workspace",
};

afterEach(() => {
  gotMocks.get.mockReset();
  gotMocks.post.mockReset();
});

describe("AzureReposGit", () => {
  it("creates a branch, pushes plan files, and opens a pull request", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ado-git-"));
    const planFile = path.join(tempDir, "plan.json");
    fs.writeFileSync(planFile, '{"planId":"plan-1"}');

    gotMocks.get.mockImplementation(async (resource, options) => {
      if (resource === "refs") {
        const filter = options.searchParams.filter;
        if (filter === "refs/heads/main") {
          return {
            statusCode: 200,
            body: { value: [{ objectId: "base-sha" }] },
          };
        }
        if (filter === "refs/heads/entity-sync-plan-abc") {
          return { statusCode: 200, body: { value: [] } };
        }
      }
      if (resource === "items") {
        return { statusCode: 404, body: {} };
      }
      throw new Error(`Unexpected GET ${resource}`);
    });

    gotMocks.post.mockImplementation(async (resource) => {
      if (resource === "refs") {
        return { statusCode: 201, body: {} };
      }
      if (resource === "pushes") {
        return {
          statusCode: 201,
          body: { commits: [{ commitId: "commit-sha" }] },
        };
      }
      if (resource === "pullrequests") {
        return { statusCode: 201, body: { pullRequestId: 1 } };
      }
      throw new Error(`Unexpected POST ${resource}`);
    });

    const git = new AzureReposGit(context);
    const result = await git.commitFiles({
      files: [{ absolutePath: planFile, repoPath: ".synatic/plans/plan.json" }],
      branchName: "entity-sync-plan-abc",
      baseBranch: "main",
      commitMessage: "chore: update entity sync plan",
      createPr: true,
      prTitle: "Entity sync plan",
      prBody: "Automated plan",
    });

    expect(result.branchName).toBe("entity-sync-plan-abc");
    expect(result.commitSha).toBe("commit-sha");
    expect(gotMocks.post).toHaveBeenCalledWith(
      "pullrequests",
      expect.objectContaining({
        json: expect.objectContaining({
          title: "Entity sync plan",
        }),
      })
    );
  });
});
