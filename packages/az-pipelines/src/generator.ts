import { safeLoad as parseYaml } from 'js-yaml';
import {
  heading,
  table,
  code,
  yamlBlock,
  bold,
  italics,
} from './utils/markdown';
import { TemplateMetaData, GenerateOptions, Template } from './interfaces';
import {
  getParameterList,
  getTemplateType,
  requiredParameter,
} from './utils/templates';

function maybe(condition: any, value?: any, otherwise?: any) {
  if (condition) {
    const v = value === undefined ? condition : value;
    if (Array.isArray(v)) {
      return v;
    }
    return [v];
  } else if (otherwise !== undefined) {
    const v = otherwise;
    if (Array.isArray(v)) {
      return v;
    }
    return [v];
  } else {
    return [];
  }
}

function parameterMeta(meta: TemplateMetaData, parameterName: string) {
  return meta.parameters?.[parameterName];
}

function generateHeading(meta: TemplateMetaData, options: GenerateOptions) {
  return heading(
    [meta.name, ...maybe(meta.version, `(v${meta.version})`)].join(' '),
    options.headingDepth
  );
}

function generateDeprecatedWarning(meta: TemplateMetaData) {
  return maybe(
    meta.deprecated,
    bold(
      italics(
        meta.deprecatedWarning
          ? `⚠ DEPRECATED: ${meta.deprecatedWarning} ⚠`
          : `⚠ DEPRECATED ⚠`
      )
    )
  );
}

function generateTemplateType(template: Template) {
  const templateType = getTemplateType(template);

  return maybe(templateType, italics(`Template type: ${code(templateType)}`));
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

  const templateType = getTemplateType(template);

  if (!templateType) {
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

  const insertTemplateGenerators: Record<typeof templateType, () => string> = {
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
    insertTemplateGenerators[templateType](),
  ];
}

function generateParameters(
  template: Template,
  meta: TemplateMetaData,
  options: GenerateOptions
) {
  let parameterList = getParameterList(template.parameters);

  if (!parameterList) {
    return [];
  }

  return [
    heading('Parameters', options.headingDepth + 1),
    table([
      ['Parameter', 'Type', 'Default', 'Description'],
      ...parameterList.map(param => {
        const paramMeta = param.name
          ? parameterMeta(meta, param.name)
          : undefined;
        const isRequired = requiredParameter(param);
        return [
          [
            maybe(param.displayName),
            maybe(param.name, `(${code(param.name)})`),
            maybe(isRequired, ' (required)'),
          ].join(' '),
          [
            maybe(param.type, code(param.type)),
            maybe(paramMeta?.format, `(${code(paramMeta?.format)})`),
          ].join(' '),
          [maybe(isRequired, 'N/A', code(JSON.stringify(param.default)))].join(
            ' '
          ),
          [maybe(paramMeta?.description, undefined, 'TODO')].join(' '),
        ];
      }),
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
    ...generateTemplateType(template),
    ...generateDescription(meta),
    ...generateUsage(template, meta, fullOptions),
    ...generateParameters(template, meta, fullOptions),
  ];

  return lines.join('\n\n');
}
