<!-- this file was generated by pipelinedoc - do not modify directly -->

# Stages (parameters & properties)

_Source: [/fixtures/stages-params-properties.yml](/fixtures/stages-params-properties.yml)_
<br/>
_Template type: `stages`_
<br/>
_Version: 1_

A stages template with parameters and a properties file.


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
  - template: fixtures/stages-params-properties.yml@templates
    # parameters:
      # name: value
```

## Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`name`|`string` |`"value"`|A useless parameter|