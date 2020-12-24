# My docs

## My fancy template (v1)

*__⚠ DEPRECATED: Use v2 ⚠__*

What does this do?

Example usage:

```yaml
jobs:
- template: fixtures/fixture.yml@templates
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`my_param`|`string`|`"word"`|The thing of the thing|

## My fancy template (v2)

What does this do?

Example usage:

```yaml
jobs:
- template: fixtures/fixture.yml
```

### Parameters

|Parameter|Type|Default|Description|
|---|---|---|---|
|`my_param`|`string`|`"word"`|The thing of the thing|
