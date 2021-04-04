# validate-terraform-plan-v1.steps

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
      - template: nureva/terraform/validate-terraform-plan-v1.steps.yml@templates
        parameters:
          terraformPlanFilePath: string
          succeedOnDestroy: boolean
          workingDirectory: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|Terraform Plan File Path (`terraformPlanFilePath`)  (required)|`string` |N/A|TODO|
|Succeed On Destroy (`succeedOnDestroy`) |`boolean` |`false`|TODO|
|Working Directory (`workingDirectory`) |`string` |`"$(Pipeline.Workspace)"`|TODO|
