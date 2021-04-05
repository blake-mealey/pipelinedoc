import { GluegunToolbox } from 'gluegun';
import simpleGit from 'simple-git';
import GitUrlParse from 'git-url-parse';
import { basename } from 'path';
import {
  RepoMetaData,
  GenerateOptions,
  TemplateMetaData,
  Template,
  getParameterList,
  generate
} from '../az-pipelines';
import { heading, unorderedList, link } from '../az-pipelines/utils/markdown';
import yaml from 'js-yaml';

let hadErrorsValue = false;
function padMessage(message: string) {
  return message.replace(/\r/g, '').replace(/\n/g, '\n      ');
}

export function trackWarning(toolbox: GluegunToolbox, message: string) {
  const {
    parameters: { options },
    print: { warning },
    doc: { trackError }
  } = toolbox;

  if (options.strict) {
    trackError(message);
  } else {
    warning(`WARN: ` + padMessage(message));
  }
}

export function trackError(toolbox: GluegunToolbox, message: string) {
  const {
    print: { error }
  } = toolbox;

  error(`ERR:  ` + padMessage(message));
  hadErrorsValue = true;
}

export function hadErrors() {
  return hadErrorsValue;
}

export async function getGitUrl() {
  try {
    const git = simpleGit();
    const remotes = await git.getRemotes(true);
    const remote = remotes.find(({ name }) => name === 'origin') ?? remotes[0];
    return GitUrlParse(remote?.refs.fetch);
  } catch (e) {
    return;
  }
}

export async function getRepoDetails(toolbox: GluegunToolbox) {
  const {
    doc: { getGitUrl }
  } = toolbox;

  const gitUrl = await getGitUrl();

  if (!gitUrl) {
    return;
  }

  const sourceToType = {
    'azure.com': 'git',
    'dev.azure.com': 'git',
    'visualstudio.com': 'git',
    'github.com': 'github',
    'bitbucket.org': 'bitbucket'
  };

  return {
    name: `${gitUrl.owner}/${gitUrl.name}`,
    type: sourceToType[gitUrl.source]
  } as RepoMetaData;
}

export function assertValidProperty(
  toolbox: GluegunToolbox,
  fileName: string,
  properties: Partial<TemplateMetaData>,
  property: keyof TemplateMetaData,
  type: string | string[],
  required = true
) {
  const {
    doc: { trackWarning },
    print: {
      colors: { underline }
    }
  } = toolbox;

  type = Array.isArray(type) ? type : [type];
  const propertyValue = properties[property];
  if (required && !propertyValue === undefined) {
    trackWarning(
      `Missing property '${property}' in properties file ${underline(fileName)}`
    );
  } else if (
    propertyValue !== undefined &&
    !type.includes(typeof propertyValue)
  ) {
    trackWarning(
      `Property '${property}' is incorrect type (expected ${type.join(
        '|'
      )}) in properties file ${underline(fileName)}`
    );
  }
}

export function assertValidParameters(
  toolbox: GluegunToolbox,
  templateFileName: string,
  propertiesFileName: string,
  properties: Partial<TemplateMetaData>,
  template: Template
) {
  const {
    doc: { trackWarning, assertValidProperty },
    print: {
      colors: { underline }
    }
  } = toolbox;

  const parametersList = getParameterList(template.parameters);

  if (parametersList.length > 0) {
    assertValidProperty(propertiesFileName, properties, 'parameters', 'object');
  }

  const parametersMeta = properties.parameters
    ? Object.entries(properties.parameters)
    : undefined;

  parametersMeta?.forEach(([name, meta]) => {
    if (!parametersList.some(param => param.name === name)) {
      trackWarning(
        `Parameter '${name}' from properties file ${underline(
          propertiesFileName
        )} does not exist in corresponding template ${underline(
          templateFileName
        )}`
      );
    } else {
      if (!meta.description) {
        trackWarning(
          `Parameter '${name}' from properties file ${underline(
            propertiesFileName
          )} is missing property 'description'`
        );
      } else if (typeof meta.description !== 'string') {
        trackWarning(
          `Parameter '${name}' from properties file ${underline(
            propertiesFileName
          )} has incorrectly typed property 'description' (expected string)`
        );
      }
      if (meta.format && typeof meta.format !== 'string') {
        trackWarning(
          `Parameter '${name}' from properties file ${underline(
            propertiesFileName
          )} has incorrectly typed property 'format' (expected string)`
        );
      }
    }
  });
}

export function getPropertiesFile(toolbox: GluegunToolbox, file: string) {
  const {
    filesystem: { exists },
    doc: { trackWarning },
    print: {
      colors: { underline }
    }
  } = toolbox;

  const extensions = ['yml', 'yaml', 'json'];
  const baseName = file.substring(0, file.lastIndexOf('.'));
  for (const ext of extensions) {
    const propertiesFile = baseName + `.properties.${ext}`;
    if (exists(propertiesFile) === 'file') {
      return propertiesFile;
    }
  }

  trackWarning(
    `Missing properties file ${underline(
      baseName + '.properties.(yml|yaml|json)'
    )} for template ${underline(file)}`
  );
}

export async function generateDocs(
  toolbox: GluegunToolbox,
  files: string[],
  generateOptions: Partial<GenerateOptions>,
  repoMeta: Partial<TemplateMetaData>,
  outputDir: string
) {
  const {
    filesystem: { readAsync, writeAsync, path },
    print: {
      colors: { underline }
    },
    doc: {
      trackError,
      getPropertiesFile,
      assertValidProperty,
      assertValidParameters
    }
  } = toolbox;

  try {
    const results = await Promise.all(
      files
        .filter(
          file =>
            (file.endsWith('.yml') && !file.endsWith('.properties.yml')) ||
            (file.endsWith('yaml') && !file.endsWith('.properties.yaml'))
        )
        .map(async file => {
          const data = await readAsync(file);

          let properties: TemplateMetaData = {
            name: basename(file.substring(0, file.lastIndexOf('.')))
          };

          let template: Template | undefined;
          try {
            template = yaml.load(data) as Template;
          } catch (e) {
            throw new Error(
              `Failed to parse YAML of template ${underline(file)}:\n${
                e.message
              }`
            );
          }

          const propertiesFile = getPropertiesFile(file);
          if (propertiesFile) {
            let fromFile: any | undefined;
            try {
              fromFile = yaml.load(await readAsync(propertiesFile));
            } catch (e) {
              throw new Error(
                `Failed to load properties file ${underline(
                  propertiesFile
                )}:\n${e.message}`
              );
            }
            properties = {
              name: fromFile.name,
              description: fromFile.description,
              version: fromFile.version,
              deprecated: fromFile.deprecated ?? !!fromFile.deprecatedWarning,
              deprecatedWarning: fromFile.deprecatedWarning,
              parameters: fromFile.parameters
            };

            assertValidProperty(propertiesFile, properties, 'name', 'string');
            assertValidProperty(
              propertiesFile,
              properties,
              'description',
              'string'
            );
            assertValidProperty(propertiesFile, properties, 'version', [
              'string',
              'number'
            ]);
            assertValidProperty(
              propertiesFile,
              properties,
              'deprecated',
              'boolean',
              false
            );
            assertValidProperty(
              propertiesFile,
              properties,
              'deprecatedWarning',
              'string',
              false
            );

            assertValidParameters(file, propertiesFile, properties, template);
          }

          const markdown = generate(
            data,
            {
              ...properties,
              ...repoMeta,
              filePath: file
            },
            generateOptions
          );
          await writeAsync(path(outputDir, `${file}.md`), markdown);

          return {
            file
          };
        })
    );

    const indexFile = path(outputDir, 'index.md');
    const markdown = [
      heading('Pipeline Docs', 1),
      unorderedList(results.map(x => link(x.file, `${x.file}.md`)))
    ].join('\n\n');
    await writeAsync(indexFile, markdown);
  } catch (e) {
    trackError(e.message);
  }
}
