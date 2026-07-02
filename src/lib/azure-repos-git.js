import fs from "node:fs";
import got from "got";
import { ZERO_OBJECT_ID } from "./azure-context.js";

export class AzureReposGit {
  /**
   * @param {import('./types.js').AzureContext} context
   */
  constructor(context) {
    this.context = context;
    this.client = got.extend({
      prefixUrl: this.getApiBase(),
      headers: {
        Authorization: `Bearer ${context.accessToken}`,
        "Content-Type": "application/json",
      },
      responseType: "json",
      throwHttpErrors: false,
    });
  }

  /**
   * @returns {string}
   */
  getApiBase() {
    const encodedProject = encodeURIComponent(this.context.project);
    return `${this.context.collectionUri}${encodedProject}/_apis/git/repositories/${this.context.repoId}`;
  }

  /**
   * @param {string} branchName
   * @returns {string}
   */
  refName(branchName) {
    return branchName.startsWith("refs/heads/")
      ? branchName
      : `refs/heads/${branchName}`;
  }

  /**
   * @param {string} branchName
   * @returns {Promise<string | null>}
   */
  async getRefObjectId(branchName) {
    const response = await this.client.get("refs", {
      searchParams: {
        filter: this.refName(branchName),
        "api-version": "7.1",
      },
    });

    if (response.statusCode !== 200) {
      throw new Error(
        `Failed to read ref ${branchName} (HTTP ${response.statusCode})`
      );
    }

    const body = /** @type {{ value?: Array<{ objectId?: string }> }} */ (
      response.body
    );
    const match = body.value?.[0];
    return match?.objectId || null;
  }

  /**
   * @param {string} branchName
   * @param {string} objectId
   * @returns {Promise<void>}
   */
  async createBranchRef(branchName, objectId) {
    const response = await this.client.post("refs", {
      searchParams: {
        "api-version": "7.1",
      },
      json: [
        {
          name: this.refName(branchName),
          oldObjectId: ZERO_OBJECT_ID,
          newObjectId: objectId,
        },
      ],
    });

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      throw new Error(
        `Failed to create branch ${branchName} (HTTP ${response.statusCode})`
      );
    }
  }

  /**
   * @param {string} repoPath
   * @returns {Promise<"add" | "edit">}
   */
  async getChangeType(repoPath) {
    const normalizedPath = repoPath.startsWith("/") ? repoPath : `/${repoPath}`;
    const response = await this.client.get("items", {
      searchParams: {
        path: normalizedPath,
        "api-version": "7.1",
      },
    });

    if (response.statusCode === 404) {
      return "add";
    }
    if (response.statusCode !== 200) {
      throw new Error(
        `Failed to inspect ${repoPath} (HTTP ${response.statusCode})`
      );
    }
    return "edit";
  }

  /**
   * @param {Object} params
   * @param {Array<{ absolutePath: string, repoPath: string }>} params.files
   * @param {string} params.branchName
   * @param {string} params.baseBranch
   * @param {string} params.commitMessage
   * @param {boolean} params.createPr
   * @param {string} params.prTitle
   * @param {string} params.prBody
   * @returns {Promise<{ branchName: string, commitSha: string }>}
   */
  async commitFiles({
    files,
    branchName,
    baseBranch,
    commitMessage,
    createPr,
    prTitle,
    prBody,
  }) {
    const resolvedBaseBranch = baseBranch || "main";
    const baseSha = await this.getRefObjectId(resolvedBaseBranch);
    if (!baseSha) {
      throw new Error(`Base branch '${resolvedBaseBranch}' was not found`);
    }

    let branchSha = await this.getRefObjectId(branchName);
    if (!branchSha) {
      await this.createBranchRef(branchName, baseSha);
      branchSha = baseSha;
    }

    const changes = [];
    for (const file of files) {
      const repoPath = file.repoPath.startsWith("/")
        ? file.repoPath
        : `/${file.repoPath}`;
      const changeType = await this.getChangeType(repoPath);
      changes.push({
        changeType,
        item: { path: repoPath },
        newContent: {
          content: fs.readFileSync(file.absolutePath, "utf8"),
          contentType: "rawtext",
        },
      });
    }

    const pushResponse = await this.client.post("pushes", {
      searchParams: {
        "api-version": "7.1",
      },
      json: {
        refUpdates: [
          {
            name: this.refName(branchName),
            oldObjectId: branchSha,
          },
        ],
        commits: [
          {
            comment: commitMessage,
            changes,
          },
        ],
      },
    });

    if (pushResponse.statusCode !== 201 && pushResponse.statusCode !== 200) {
      const body = pushResponse.body;
      const detail =
        body && typeof body === "object" && "message" in body
          ? String(body.message)
          : JSON.stringify(body);
      throw new Error(`Azure Repos push failed (HTTP ${pushResponse.statusCode}): ${detail}`);
    }

    const pushBody = /** @type {{ commits?: Array<{ commitId?: string }> }} */ (
      pushResponse.body
    );
    const commitSha = pushBody.commits?.[0]?.commitId;
    if (!commitSha) {
      throw new Error("Azure Repos push succeeded but no commit ID was returned");
    }

    if (createPr) {
      await this.createPullRequest({
        sourceBranch: branchName,
        targetBranch: resolvedBaseBranch,
        title: prTitle,
        description: prBody,
      });
    }

    return {
      branchName,
      commitSha,
    };
  }

  /**
   * @param {Object} params
   * @param {string} params.sourceBranch
   * @param {string} params.targetBranch
   * @param {string} params.title
   * @param {string} params.description
   * @returns {Promise<void>}
   */
  async createPullRequest({ sourceBranch, targetBranch, title, description }) {
    const response = await this.client.post("pullrequests", {
      searchParams: {
        "api-version": "7.1",
      },
      json: {
        sourceRefName: this.refName(sourceBranch),
        targetRefName: this.refName(targetBranch),
        title,
        description,
      },
    });

    if (response.statusCode !== 201 && response.statusCode !== 200) {
      const body = response.body;
      const detail =
        body && typeof body === "object" && "message" in body
          ? String(body.message)
          : JSON.stringify(body);
      throw new Error(
        `Azure Repos pull request creation failed (HTTP ${response.statusCode}): ${detail}`
      );
    }
  }
}
