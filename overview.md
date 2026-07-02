# Synatic Entity Sync for Azure DevOps

Plan and execute [Synatic](https://synatic.com) entity sync from Azure Pipelines.

## Features

- **Plan** — call the Synatic entity-sync API and write `.synatic/plans/` files to the workspace
- **Auto commit** — push plan files to Azure Repos on a new branch
- **Pull requests** — optionally open a PR into your default branch
- **Execute** — preview and execute a committed plan against a destination organization

## Requirements

- Azure Repos git repository
- Synatic API URL and API key
- Build service identity with **Contribute**, **Create branch**, and **Contribute to pull requests** on the repo

## Quick start

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
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

See the [GitHub repository](https://github.com/synatic/entity-sync-azure-devops) for execute examples, permissions, and troubleshooting.

## Related packages

- [`@synatic/entity-sync-core`](https://www.npmjs.com/package/@synatic/entity-sync-core) — shared Synatic API logic
- [`entity-sync-action`](https://github.com/synatic/entity-sync-action) — GitHub Actions equivalent
