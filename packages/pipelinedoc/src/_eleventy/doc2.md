---
title: hello-world-v1
layout: docs.njk

---
# hello-world-v1

_Template type: `step` [[?]](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema#step-templates)_

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
jobs:
  - job: my_job
    steps:
      - template: hello-world-v1.steps.yml@templates
        parameters:
          name: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|
