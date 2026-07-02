# Synatic Entity Sync — Azure DevOps Extension

Azure DevOps Marketplace extension that adds the **Synatic Entity Sync** pipeline task. It uses [`@synatic/entity-sync-core`](https://www.npmjs.com/package/@synatic/entity-sync-core) for Synatic API orchestration and Azure Repos REST APIs for plan auto-commit and optional pull requests.

## Install from the Marketplace

1. Open [Visual Studio Marketplace](https://marketplace.visualstudio.com/azuredevops) and search for **Synatic Entity Sync**, or install from your organization's shared extension link after publishing.
2. In Azure DevOps: **Organization Settings → Extensions → Browse Marketplace → Install**.
3. Grant the build service identity repo permissions (**Contribute**, **Create branch**, **Contribute to pull requests**) on repositories the pipeline will update.

## Pipeline usage

```yaml
steps:
  - checkout: self
    persistCredentials: true

  - task: SynaticEntitySync@1
    displayName: Generate entity sync plan
    inputs:
      command: plan
      apiUrl: $(SYNATIC_API_URL)
      apiKey: $(SYNATIC_API_KEY)
      sourceOrgId: $(SOURCE_ORG_ID)
      rootType: flow
      rootId: $(ROOT_ID)
      autoCommit: true
      createPr: true
      prBaseBranch: main
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

Execute example:

```yaml
  - task: SynaticEntitySync@1
    displayName: Execute entity sync plan
    inputs:
      command: execute
      apiUrl: $(SYNATIC_API_URL)
      apiKey: $(SYNATIC_API_KEY)
      destOrgId: $(DEST_ORG_ID)
      planPath: .synatic/plans/plan.json
      previewFirst: true
      failOnConflict: true
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

Sample pipelines: [`pipelines/plan.yml`](pipelines/plan.yml), [`pipelines/execute.yml`](pipelines/execute.yml).

### Task outputs

| Output | When |
| --- | --- |
| `planId` | plan / execute |
| `planPath` | plan / execute |
| `branchName` | plan with auto commit |
| `commitSha` | plan with auto commit |
| `conflicts` | execute preview |
| `summary` | execute preview or execute |
| `runId` | execute |

Reference outputs in later steps as `$(SynaticEntitySync.planId)` (task name may vary by `displayName`; use the task reference name from the pipeline UI).

## Publisher setup (maintainers)

### 1. Configure the publisher

Update `publisher` in [`vss-extension.json`](vss-extension.json) to match your Marketplace publisher id (default in repo: `synatic`).

Replace `images/extension-icon.png` with a 128×128 PNG before a public listing if desired.

### 2. Build and package locally

```bash
npm ci
npm test
npm run build
npm run package:vsix
```

This produces `synatic.entity-sync-1.0.0.vsix` in the repo root.

### 3. Publish privately first

Create a PAT with **Marketplace (publish)** and **All accessible organizations** scopes.

```bash
export TFXX_PAT=your_pat
tfx extension publish \
  --manifest-globs vss-extension.json \
  --share-with agencyfuse
```

Or upload the `.vsix` manually at [Marketplace Manage](https://marketplace.visualstudio.com/manage).

`vss-extension.json` sets `"public": false` so the first upload is private. Share with test organizations before switching to public.

### 4. Version bumps

For each release:

1. Increment `version` in `vss-extension.json`
2. Increment `version.Major|Minor|Patch` in `synatic-entity-sync/task.json`
3. Run `npm run package:vsix` and publish again

## Local CLI (development)

The repo still exposes a local env-var CLI for debugging without installing the extension:

```bash
export SYNATIC_API_URL=...
export SYNATIC_API_KEY=...
export SOURCE_ORG_ID=...
export AUTO_COMMIT=false
node src/index.js plan
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `synatic-entity-sync/task.json` | Marketplace task definition |
| `synatic-entity-sync/task-entry.js` | Task handler source (bundled to `index.js`) |
| `vss-extension.json` | Extension manifest |
| `overview.md` | Marketplace listing content |
| `src/` | Shared Synatic + Azure Repos logic |

## Development

```bash
npm run lint
npm test
```

## Related packages

| Package | Role |
| --- | --- |
| `@synatic/entity-sync-core` | Synatic API client, config parsing, plan file I/O |
| `entity-sync-action` | GitHub Actions adapter |
| `entity-sync-azure-devops` | This Marketplace extension |
