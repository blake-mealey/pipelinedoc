# @pipelinedoc/cli

The CLI for generating docs for your YAML pipeline template files. [Sample generated
docs](https://github.com/blake-mealey/pipelinedoc/blob/master/fixtures/docs/index.md).

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
- `--generate-frontmatter`: generate YAML frontmatter on each `.md` file with machine-readable
  metadata.
- `--assert-unstaged`: exit with a non-zero exit if there are unstaged docs files after generating
  docs. Useful for pre-commit Git hooks to ensure your docs are up-to-date.

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
- `category`: a category to assign the template to. Used for grouping templates in the `index.md`
  doc
- `usageStyle`: the style of the usage example, either `'insert'` or `'extend'`. If `'insert'`, uses
  the template insertion syntax, and if `'extend'`, uses the template extension syntax. Defaults to
  `'insert'`.
- `deprecated`: whether or not the template is deprecated. Implicitly `true` if `deprecatedWarning`
  is supplied.
- `deprecatedWarning`: a message to include with the deprecated warning. Markdown is supported.
- `parameters.<parameter name>.description`: the description of the parameter. Markdown is
  supported.
- `examples.<index>.title`: the title of a usage example. Markdown is supported.
- `examples.<index>.description`: the description of a usage example. Markdown is supported.
- `examples.<index>.example`: the example YAML object. Examples may include variables in keys or
  values using the syntax `$<variableName>`. The following variables are available:
  - `templatePath`: the template path (including repo identifier) to include the template with.

### Example

```yaml
name: My template
version: 1
description: |
  This is my _fancy_ description with **markdown**!
category: Utils
parameters:
  myParameter:
    description: |
      This is my parameter with the name `myParameter`.
examples:
  - example:
      stages:
        - stage: my_stage
          jobs:
            - template: $<templatePath>
              parameters:
                myParameter: the best way to use me
  - title: Example title
    description: Some more details here.
    example:
      jobs:
        - template: $<templatePath>
          parameters:
            myParameter: another option
```
