# install-ps-modules-v1.steps

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
      - template: nureva/nuget/install-ps-modules-v1.steps.yml@templates
        parameters:
          modules: object
          artifactsEndpoint: string
          repositoryName: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|Modules (`modules`)  (required)|`object` |N/A|TODO|
|Azure DevOps Artifacts Endpoint (`artifactsEndpoint`) |`string` |`"https://nureva.pkgs.visualstudio.com/_packaging/Nureva"`|TODO|
|Repository Name (`repositoryName`) |`string` |`"Nureva"`|TODO|
