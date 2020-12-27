# Hello World Stages (v1)

_Template type: `jobs`_

A job which says "Hello" to the provided name (defaults to "World"). Utilizes the hello-world-v1.steps template under the hood.

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
|Name (`name`) |`string` |`"World"`|Name of the person to say hello to.|
