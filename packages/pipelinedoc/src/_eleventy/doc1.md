---
title: hello-world-v1
layout: docs.njk

---
# hello-world-v1

_Template type: `stage` [[?]](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema#stage-templates)_

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
stages:
  - template: hello-world-v1.stages.yml@templates
    parameters:
      name: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|
