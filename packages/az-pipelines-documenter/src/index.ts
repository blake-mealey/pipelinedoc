import { safeLoad as parseYaml, safeDump as stringifyYaml } from 'js-yaml';

export interface TemplateMetaData {
  name: string;
  description?: string;
  version?: number | string;
  deprecatedWarning?: string;
  filePath?: string;
  repo?: {
    identifier: string;
    type: 'git' | 'github' | 'bitbucket';
    name: string;
    ref?: string;
    endpoint?: string;
  };
}

export interface GenerateOptions {
  headingDepth: number;
}

function heading(text: string, depth: number) {
  return Array(depth).fill('#').join('') + ' ' + text;
}

function table([header, ...rows]: string[][]) {
  const formatRow = (row: string[]) => `|${row.join('|')}|\n`;
  return (
    formatRow(header) +
    formatRow(header.map(() => '---')) +
    rows.map(formatRow).join('')
  );
}

function code(text?: string) {
  return text ? '`' + text.trim() + '`' : '';
}

function codeBlock(lang: string, text: string) {
  return '```' + `${lang}\n${text.trim()}\n` + '```';
}

function yamlBlock(yamlObject: any) {
  return codeBlock(
    'yaml',
    stringifyYaml(yamlObject, {
      skipInvalid: true,
    })
  );
}

function bold(text: string) {
  return `*${text}*`;
}

function italics(text: string) {
  return `__${text}__`;
}

type TemplateParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'step'
  | 'stepList'
  | 'job'
  | 'jobList'
  | 'deployment'
  | 'deploymentList'
  | 'stage'
  | 'stageList';

interface TemplateParameter {
  name?: string;
  displayName?: string;
  type?: TemplateParameterType;
  default?: any;
  values?: string[];
}

type TemplateParameters = TemplateParameter[] | Record<string, any>;

interface Template {
  parameters?: TemplateParameters;
  steps?: any;
  jobs?: any;
  stages?: any;
  variables?: any;
}

function maybe(condition: any, value?: any) {
  if (condition) {
    const v = value === undefined ? condition : value;
    if (Array.isArray(v)) {
      return v;
    }
    return [v];
  } else {
    return [];
  }
}

function requiredParameter(parameter: TemplateParameter) {
  return parameter.default === undefined;
}

function getParameterList(
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
        type: guessType(value),
      }));
}

function generateHeading(meta: TemplateMetaData, options: GenerateOptions) {
  return heading(
    [meta.name, ...maybe(meta.version, `(v${meta.version})`)].join(' '),
    options.headingDepth
  );
}

function generateDeprecatedWarning(meta: TemplateMetaData) {
  return maybe(
    meta.deprecatedWarning,
    bold(italics(`⚠ DEPRECATED: ${meta.deprecatedWarning} ⚠`))
  );
}

function generateDescription(meta: TemplateMetaData) {
  return maybe(meta.description);
}

function generateUsage(
  template: Template,
  meta: TemplateMetaData,
  options: GenerateOptions
) {
  if (!meta.filePath) {
    return [];
  }

  const usageType = template.steps
    ? 'steps'
    : template.jobs
    ? 'jobs'
    : template.stages
    ? 'stages'
    : template.variables
    ? 'variables'
    : undefined;

  if (!usageType) {
    return [];
  }

  let templatePath =
    meta.filePath + (meta.repo ? `@${meta.repo.identifier}` : '');

  const parameterList = getParameterList(template.parameters);
  let parameters: any | undefined;
  if (parameterList) {
    parameters = Object.fromEntries(
      parameterList.map((param): [string, string] => [
        param.name ?? '',
        param.type ?? '',
      ])
    );
  }

  const insertTemplateGenerators: Record<typeof usageType, () => string> = {
    steps: () =>
      yamlBlock({
        jobs: [
          {
            job: 'my_job',
            steps: [{ template: templatePath, parameters }],
          },
        ],
      }),
    jobs: () =>
      yamlBlock({
        jobs: [{ template: templatePath, parameters }],
      }),
    stages: () =>
      yamlBlock({
        stages: [{ template: templatePath, parameters }],
      }),
    variables: () =>
      yamlBlock({
        variables: [{ template: templatePath, parameters }],
      }),
  };

  let templateRepoUsage: string[] | undefined;
  if (meta.repo) {
    templateRepoUsage = [
      'Use template repository:',
      yamlBlock({
        resources: {
          repositories: [
            {
              repo: meta.repo.identifier,
              name: meta.repo.name,
              ref: meta.repo.ref,
              type: meta.repo.type,
            },
          ],
        },
      }),
    ];
  }

  return [
    heading('Example usage', options.headingDepth + 1),
    ...maybe(templateRepoUsage),
    'Insert template:',
    insertTemplateGenerators[usageType](),
  ];
}

function generateParameters(template: Template, options: GenerateOptions) {
  let parameterList = getParameterList(template.parameters);

  if (!parameterList) {
    return [];
  }

  return [
    heading('Parameters', options.headingDepth + 1),
    table([
      ['Parameter', 'Type', 'Default', 'Description'],
      ...parameterList.map((param) => [
        (code(param.name) ?? '') +
          (requiredParameter(param) ? ' (required)' : ''),
        code(param.type) ?? '',
        requiredParameter(param) ? 'N/A' : code(JSON.stringify(param.default)),
        param.displayName ?? '',
      ]),
    ]),
  ];
}

export function generate(
  data: string,
  meta: TemplateMetaData,
  options?: Partial<GenerateOptions>
) {
  const template = parseYaml(data) as Template;

  const fullOptions: GenerateOptions = {
    headingDepth: options?.headingDepth ?? 1,
  };

  const lines: (string | undefined)[] = [
    generateHeading(meta, fullOptions),
    ...generateDeprecatedWarning(meta),
    ...generateDescription(meta),
    ...generateUsage(template, meta, fullOptions),
    ...generateParameters(template, fullOptions),
  ];

  return lines.join('\n\n');
}
