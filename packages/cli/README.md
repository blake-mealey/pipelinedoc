# @pipelinedoc/cli

The CLI for generating docs for your YAML pipeline template files.

## Install

Install with NPM:

```sh
npm install -g @pipelinedoc/cli
```

or install with yarn:

```sh
yarn global add @pipelinedoc/cli
```

## Commands

### Generate

Generate markdown docs from your templates. Currently only supports Azure Pipelines templates.

```sh
pipelinedoc generate <files> [options]
```

#### Arguments:

- `files`: specify a space-separated list of [glob patterns](https://www.npmjs.com/package/glob) to
  match your pipeline templates.

#### Options

- `--out-dir`, `-o`: specify the directory to output the files to. Defaults to `./docs`.
- `--strict`: in strict mode, warnings are considered errors and the CLI will exit with a non-zero
  exit code.
- `--repo-identifier`: the repo identifier for importing templates in Azure Pipelines. Defaults to
  `templates`.
