# publish-ip-report-v2.jobs

_Template type: `jobs`_

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
  - template: nureva/ip-reports/publish-ip-report-v2.jobs.yml@templates
    parameters:
      azureSubscription: string
      storageAccount: string
      projectDisplayName: string
      containerName: string
      dependsOn: string
      condition: string
      artifactName: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|Azure Subscription (`azureSubscription`)  (required)|`string` |N/A|TODO|
|Storage account name (`storageAccount`)  (required)|`string` |N/A|TODO|
|Display name of the project (`projectDisplayName`)  (required)|`string` |N/A|TODO|
|Storage container name (`containerName`) |`string` |`"ip-reports"`|TODO|
|Depends on job name(s) (`dependsOn`) |`string` |`""`|TODO|
|The condition that the job will run on (`condition`) |`string` |`""`|TODO|
|IP Report artifact name (`artifactName`) |`string` |`"IP_Report"`|TODO|
