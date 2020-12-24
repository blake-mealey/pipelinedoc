import { safeLoad as parseYaml } from 'js-yaml';
import { promises as fs } from 'fs';

interface GenerateOptions {
  name: string;
  description?: string;
  version?: number | string;
  deprecatedWarning?: string;
  headingDepth?: number;
  templatePath?: string;
  templateRepo?: {
    identifier: string;
    type: 'git' | 'github' | 'bitbucket';
    name: string;
    ref?: string;
    endpoint?: string;
  };
}

function heading(text: string, depth: number) {
  return (
    Array(depth)
      .fill('#')
      .join('') +
    ' ' +
    text
  );
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
  return '```' + lang + '\n' + text.trim() + '\n' + '```';
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
    return [value === undefined ? condition : value];
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

function generateHeading(options: GenerateOptions) {
  return heading(
    [options.name, ...maybe(options.version, `(v${options.version})`)].join(
      ' '
    ),
    options.headingDepth ?? 1
  );
}

function generateDeprecatedWarning(options: GenerateOptions) {
  return maybe(
    options.deprecatedWarning,
    bold(italics(`⚠ DEPRECATED: ${options.deprecatedWarning} ⚠`))
  );
}

function generateDescription(options: GenerateOptions) {
  return maybe(options.description);
}

function generateUsage(template: Template, options: GenerateOptions) {
  if (!options.templatePath) {
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
    options.templatePath +
    (options.templateRepo ? `@${options.templateRepo.identifier}` : '');

  let parametersUsage: string;

  if (template.parameters) {
  }

  let usage: string;

  switch (usageType) {
    case 'steps':
      usage = codeBlock(
        'yaml',
        `jobs:
- job: MyJob
  steps:
  - template: ${templatePath}`
      );
      break;
    case 'jobs':
      usage = codeBlock(
        'yaml',
        `jobs:
- template: ${templatePath}`
      );
      break;
    case 'stages':
      usage = codeBlock(
        'yaml',
        `stages:
- template: ${templatePath}`
      );
      break;
    default:
      usage = '';
  }

  return ['Example usage:', usage];
}

function generateParameters(
  headingDepth: number,
  parameters?: TemplateParameters
) {
  let parameterList = getParameterList(parameters);

  if (!parameterList) {
    return [];
  }

  // Sort by required or not
  parameterList = parameterList.sort((a, b) =>
    requiredParameter(a) !== requiredParameter(b)
      ? requiredParameter(a)
        ? -1
        : 1
      : 0
  );

  return [
    heading('Parameters', headingDepth),
    table([
      ['Parameter', 'Type', 'Default', 'Description'],
      ...parameterList.map(param => [
        (code(param.name) ?? '') +
          (requiredParameter(param) ? ' (required)' : ''),
        code(param.type) ?? '',
        requiredParameter(param) ? 'N/A' : code(JSON.stringify(param.default)),
        param.displayName ?? '',
      ]),
    ]),
  ];
}

export function generate(data: string, options: GenerateOptions) {
  const template = parseYaml(data) as Template;

  const lines: (string | undefined)[] = [
    generateHeading(options),
    ...generateDeprecatedWarning(options),
    ...generateDescription(options),
    ...generateUsage(template, options),
    ...generateParameters((options.headingDepth ?? 1) + 1, template.parameters),
  ];

  return lines.join('\n\n');
}

async function test() {
  const file = await fs.readFile('./fixture.yml', { encoding: 'utf-8' });
  const markdown = generate(file, {
    name: 'My fancy template',
    version: 1,
    deprecatedWarning: 'Use v2',
    description: 'What does this do?',
    headingDepth: 2,
    templatePath: 'fixtures/fixture.yml',
    templateRepo: {
      identifier: 'templates',
      name: 'Project/RepoName',
      type: 'git',
    },
  });

  const markdown2 = generate(file, {
    name: 'My fancy template',
    version: 2,
    description: 'What does this do?',
    headingDepth: 2,
    templatePath: 'fixtures/fixture.yml',
  });

  const fileOut = `# My docs

${markdown}
${markdown2}`;
  await fs.writeFile('./fixture.md', fileOut, { encoding: 'utf-8' });
}

test();
