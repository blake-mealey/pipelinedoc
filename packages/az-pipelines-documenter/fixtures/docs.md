# az-pipelines-documenter

## hello-world-v1

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/az-pipelines-documenter
      type: github
```

Insert template:

```yaml
jobs:
  - template: hello-world-v1.jobs.yml@templates
    parameters:
      name: string
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/az-pipelines-documenter
      type: github
```

Insert template:

```yaml
stages:
  - template: hello-world-v1.stages.yml@templates
    parameters:
      name: string
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/az-pipelines-documenter
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

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/az-pipelines-documenter
      type: github
```

Insert template:

```yaml
variables:
  - template: hello-world-v1.variables.yml@templates
```