# pipelinedoc

Monorepo for the pipelinedoc tool. Generate documentation for your YAML pipeline template files.
Currently only supports Azure Pipelines YAML templates.

## Quick start

Install:

```sh
# npm
npm install -g @pipelinedoc/cli

# yarn
yarn global add @pipelinedoc/cli
```

Use:

```sh
pipelinedoc generate *.yml
```

See the [CLI docs](./packages/cli/README.md) for more info.
