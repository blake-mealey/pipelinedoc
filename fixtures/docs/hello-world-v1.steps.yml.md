# hello-world-v1.steps

_Template type: `steps`_

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
|Name of the person to say hello to (`name`) |`string` |`"World"`|TODO|
