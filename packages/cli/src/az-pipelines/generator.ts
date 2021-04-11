import yaml from 'js-yaml';
import { code, bold } from './utils/markdown';
import {
  TemplateMetaData,
  GenerateOptions,
  Template,
  TemplateParameter,
} from './interfaces';
import {
  getParameterList,
  getTemplateType,
  requiredParameter,
} from './utils/templates';
import nunjucks from 'nunjucks';
import path from 'path';

const nunjucksEnv = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.resolve(__dirname, '../templates')),
  {
    autoescape: false,
  }
);

nunjucksEnv.addFilter('dumpYaml', (data: any) => {
  return yaml.dump(data, { skipInvalid: true }).trim();
});

nunjucksEnv.addFilter('heading', (depth: number) => {
  return '#'.repeat(depth);
});

nunjucksEnv.addFilter('requiredParam', requiredParameter);

nunjucksEnv.addFilter('paramName', (param: TemplateParameter) => {
  let paramName = code(param.name);
  if (requiredParameter(param)) {
    paramName += bold('\\*');
  }
  if (param.displayName) {
    paramName += '<br/>' + param.displayName;
  }
  return paramName;
});

nunjucksEnv.addFilter('paramType', (param: TemplateParameter) => {
  let paramType = param.type ? code(param.type) : '';
  if (param.values) {
    const values = param.values.map((value) => code(JSON.stringify(value)));
    paramType += ' ' + `(${values.join(' \\| ')})`;
  }
  return paramType;
});

nunjucksEnv.addFilter('paramDefault', (param: TemplateParameter) => {
  if (!requiredParameter(param)) {
    return code(JSON.stringify(param.default));
  }
  return '';
});

nunjucksEnv.addFilter(
  'paramDescription',
  (param: TemplateParameter, meta: TemplateMetaData) => {
    return meta.parameters?.[param.name]?.description
      ?.replace(/\n\n/g, '<br/><br/>')
      ?.replace(/\n/g, ' ');
  }
);

export function generate(
  data: string,
  meta: TemplateMetaData,
  options?: Partial<GenerateOptions>
) {
  const template = yaml.load(data) as Template;

  const fullOptions: GenerateOptions = {
    headingDepth: options?.headingDepth ?? 1,
    generateFrontmatter: options?.generateFrontmatter ?? false,
    generator: options?.generator ?? { name: 'unknown', version: '0' },
  };

  const parameterList = getParameterList(template.parameters);
  const derived = {
    templateType: getTemplateType(template),
    parameterList: parameterList,
    hasParameters: parameterList && parameterList.length > 0,
    hasRequiredParameters: parameterList?.some((param) =>
      requiredParameter(param)
    ),
  };

  return (
    nunjucksEnv
      .render('template.md.njk', {
        template,
        meta,
        options: fullOptions,
        derived,
      })
      .trim() + '\n'
  );
}
