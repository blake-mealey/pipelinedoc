# Hello World Stage (v1)

_Template type: `stages`_

A stage which says "Hello" to the provided name (defaults to "World"). Utilizes the
hello-world-v1.jobs template under the hood.


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
|Name (`name`) |`string` |`"World"`|Name of the person to say hello to.|
