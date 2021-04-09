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

#### Arguments

- `files`: specify a space-separated list of [glob patterns](https://www.npmjs.com/package/glob) to
  match your pipeline templates.

#### Options

- `--out-dir`, `-o`: specify the directory to output the files to. Defaults to `./docs`.
- `--strict`: in strict mode, warnings are considered errors and the CLI will exit with a non-zero
  exit code.
- `--repo-identifier`: the repo identifier for importing templates in Azure Pipelines. Defaults to
  `templates`.

## Properties file

In order to fully document templates, `pipelinedoc` requires a second "properties" file for each
template. This is because adding extra meta properties to templates is disallowed by the template
parsers.

To document a template with a properties file, create a file next to your template file with the
same name but with the `.properties.yml` extension (you can also use `.yaml` and `.json` if you
prefer). For example, if I had a `my-template.yml` template, I would create a
`my-template.properties.yml` properties file.

### Supported properties

- `name`: the display name of the template.
- `version`: the version of the template. Strings and numbers are supported.
- `description`: the description of the template. Markdown is supported.
- `parameters.*.description`: the description of the parameter. Markdown is supported.

### Example

```yaml
name: My template
version: 1
description: |
  This is my _fancy_ description with **markdown**!
parameters:
  myParameter:
    description: |
      This is my parameter with the name `myParameter`.
```
