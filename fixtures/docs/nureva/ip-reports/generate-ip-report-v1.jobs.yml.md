# generate-ip-report-v1.jobs

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
  - template: nureva/ip-reports/generate-ip-report-v1.jobs.yml@templates
    parameters:
      projectName: string
      projectType: string
      packageFile: string
      excludeRegex: string
      failOnError: boolean
      failOnNpmAudit: boolean
      npmAuditLevel: string
      artifactName: string
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|Project Name (`projectName`)  (required)|`string` |N/A|TODO|
|Project Type (`projectType`)  (required)|`string` |N/A|TODO|
|Path to .sln or package.json (`packageFile`)  (required)|`string` |N/A|TODO|
|Exclude Project Regex (`excludeRegex`) |`string` |`""`|TODO|
|Fail the job on audit error (`failOnError`) |`boolean` |`true`|TODO|
|Whether the pipeline should fail if NPM audit detects vulnerabilities (`failOnNpmAudit`) |`boolean` |`true`|TODO|
|NPM audit level (`npmAuditLevel`) |`string` |`"moderate"`|TODO|
|Artifact name of IP Report (`artifactName`) |`string` |`"IP_Report"`|TODO|
