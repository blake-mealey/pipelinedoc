import {
  TemplateParameter,
  TemplateParameters,
  TemplateParameterType,
  Template
} from '../interfaces';

export function requiredParameter(parameter: TemplateParameter) {
  return parameter.default === undefined;
}

export function getParameterList(
  parameters?: TemplateParameters
): TemplateParameter[] | undefined {
  if (!parameters) {
    return;
  }

  function guessType(value: any): TemplateParameterType | undefined {
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'object') {
      return 'object';
    }
    return undefined;
  }

  return Array.isArray(parameters)
    ? parameters
    : Object.entries(parameters).map(([key, value]) => ({
        name: key,
        default: value,
        type: guessType(value)
      }));
}

export function getTemplateType(template: Template) {
  return template.steps
    ? 'steps'
    : template.jobs
    ? 'jobs'
    : template.stages
    ? 'stages'
    : template.variables
    ? 'variables'
    : undefined;
}
