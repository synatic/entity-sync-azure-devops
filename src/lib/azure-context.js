const ZERO_OBJECT_ID = "0000000000000000000000000000000000000000";

/**
 * @returns {import('./types.js').AzureContext}
 */
export function getAzureContext() {
  const collectionUri = normalizeCollectionUri(
    process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI ||
      process.env.AZURE_DEVOPS_COLLECTION_URI
  );
  const project =
    process.env.SYSTEM_TEAMPROJECT || process.env.AZURE_DEVOPS_PROJECT || "";
  const repoId =
    process.env.BUILD_REPOSITORY_ID || process.env.AZURE_DEVOPS_REPO_ID || "";
  const accessToken =
    process.env.SYSTEM_ACCESSTOKEN || process.env.AZURE_DEVOPS_ACCESS_TOKEN || "";

  if (!collectionUri) {
    throw new Error(
      "Azure DevOps collection URI is required (SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)"
    );
  }
  if (!project) {
    throw new Error("Azure DevOps project is required (SYSTEM_TEAMPROJECT)");
  }
  if (!repoId) {
    throw new Error(
      "Azure DevOps repository ID is required (BUILD_REPOSITORY_ID)"
    );
  }
  if (!accessToken) {
    throw new Error(
      "Azure DevOps access token is required (SYSTEM_ACCESSTOKEN in pipeline YAML)"
    );
  }

  return {
    collectionUri,
    project,
    repoId,
    accessToken,
    workspace:
      process.env.BUILD_SOURCESDIRECTORY ||
      process.env.ENTITY_SYNC_WORKSPACE ||
      process.cwd(),
  };
}

/**
 * @param {string | undefined} value
 * @returns {string}
 */
function normalizeCollectionUri(value) {
  if (!value) {
    return "";
  }
  return value.replace(/\/+$/, "") + "/";
}

export { ZERO_OBJECT_ID };
