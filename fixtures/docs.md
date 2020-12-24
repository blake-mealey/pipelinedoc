# RepoName Templates

## hello-world-v1.jobs.yml (v1)

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: Project/RepoName
      type: git
```

Insert template:

```yaml
jobs:
  - template: fixtures/hello-world-v1.jobs.yml@templates
    parameters:
      name: string
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1.stages.yml (v1)

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: Project/RepoName
      type: git
```

Insert template:

```yaml
stages:
  - template: fixtures/hello-world-v1.stages.yml@templates
    parameters:
      name: string
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1.steps.yml (v1)

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: Project/RepoName
      type: git
```

Insert template:

```yaml
jobs:
  - job: my_job
    steps:
      - template: fixtures/hello-world-v1.steps.yml@templates
        parameters:
          name: string
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string`|`"World"`|Name of the person to say hello to|

## hello-world-v1.variables.yml (v1)

### Example usage

Use template repository:

```yaml
resources:
  repositories:
    - repo: templates
      name: Project/RepoName
      type: git
```

Insert template:

```yaml
variables:
  - template: fixtures/hello-world-v1.variables.yml@templates
```