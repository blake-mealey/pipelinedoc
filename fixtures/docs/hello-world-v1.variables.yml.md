# hello-world-v1.variables

_Template type: `variables`_

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
variables:
  - template: hello-world-v1.variables.yml@templates
```