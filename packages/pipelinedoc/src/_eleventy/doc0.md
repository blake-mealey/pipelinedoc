---
title: hello-world-v1
layout: docs.njk

---
# hello-world-v1

_Template type: `job` [[?]](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema#job-templates)_

A job which says "Hello" to the provided name (defaults to "World").
Utlizes the hello-world-v1.steps template under the hood.

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
  - template: hello-world-v1.jobs.yml@templates
    parameters:
      name: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|
