---
title: hello-world-v1
layout: docs.njk

---
# hello-world-v1

_Template type: `variable` [[?]](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema#variable-templates)_

## Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/pipelinedoc
      type: github
```

Insert template:

```yaml
variables:
  - template: hello-world-v1.variables.yml@templates
```