import { GluegunToolbox } from 'gluegun';
import {
  generate,
  GenerateOptions,
  RepoMetaData,
  Template,
  TemplateMetaData
} from 'az-pipelines-documenter';
import { getParameterList } from 'az-pipelines-documenter/src/utils/templates';
import { glob } from 'glob';
import { promisify } from 'util';
import { basename } from 'path';
import simpleGit from 'simple-git/promise';
import GitUrlParse from 'git-url-parse';
import { safeLoad as parseYaml } from 'js-yaml';

const globAsync = promisify(glob);

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: {
        error,
        warning,
        colors: { underline }
      },
      parameters: { array: patterns, options },
      filesystem: { writeAsync, readAsync, path, exists }
    } = toolbox;

    let hadErrors = false;
    function padMessage(message: string) {
      return message.replace(/\r/g, '').replace(/\n/g, '\n      ');
    }

    function trackWarning(message: string) {
      if (options.strict) {
        trackError(message);
      } else {
        warning(`WARN: ` + padMessage(message));
      }
    }

    function trackError(message: string) {
      error(`ERR:  ` + padMessage(message));
      hadErrors = true;
    }

    async function getGitUrl() {
      try {
        const git = simpleGit();
        const remotes = await git.getRemotes(true);
        const remote =
          remotes.find(({ name }) => name === 'origin') ?? remotes[0];
        return GitUrlParse(remote?.refs.fetch);
      } catch (e) {
        return;
      }
    }

    function getRepoDetails(gitUrl: any) {
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

    const gitUrl = await getGitUrl();
    const repoDetails = getRepoDetails(gitUrl);

    const files = (
      await Promise.all(
        patterns.map(pattern =>
          globAsync(pattern, {
            ignore: ['node_modules', '.git']
          })
        )
      )
    ).flat();

    const generateOptions: Partial<GenerateOptions> = {
      headingDepth: 1
    };

    const meta: Partial<TemplateMetaData> = {
      repo: {
        ...repoDetails,
        identifier: options.repoIdentifier ?? 'templates'
      }
    };

    const outputDir = options.out ?? './docs';

    function assertValidProperty(
      fileName: string,
      properties: Partial<TemplateMetaData>,
      property: keyof TemplateMetaData,
      type: string | string[]
    ) {
      type = Array.isArray(type) ? type : [type];
      if (!properties[property]) {
        trackWarning(
          `Missing property '${property}' in properties file ${underline(
            fileName
          )}`
        );
      } else if (!type.includes(typeof properties[property])) {
        trackWarning(
          `Property '${property}' is incorrect type (expected ${type.join(
            '|'
          )}) in properties file ${underline(fileName)}`
        );
      }
    }

    function assertValidParameters(
      templateFileName: string,
      propertiesFileName: string,
      properties: Partial<TemplateMetaData>,
      template: Template
    ) {
      const parametersList = getParameterList(template.parameters);

      if (parametersList.length > 0) {
        assertValidProperty(
          propertiesFileName,
          properties,
          'parameters',
          'object'
        );
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

    try {
      await Promise.all(
        files
          .filter(file => file.endsWith('.yml') || file.endsWith('yaml'))
          .map(async file => {
            const data = await readAsync(file);

            let properties: TemplateMetaData = {
              name: basename(file.substring(0, file.lastIndexOf('.')))
            };

            let template: Template | undefined;
            try {
              template = parseYaml(data) as Template;
            } catch (e) {
              throw new Error(
                `Failed to parse YAML of template ${underline(file)}:\n${
                  e.message
                }`
              );
            }

            const propertiesFile =
              file.substring(0, file.lastIndexOf('.')) + '.properties.json';
            if (exists(propertiesFile) === 'file') {
              let fromFile: any | undefined;
              try {
                fromFile = JSON.parse(await readAsync(propertiesFile));
              } catch (e) {
                throw new Error(`Failed to load properties file ${underline(propertiesFile)}:\n${e.message}`);
              }
              properties = {
                name: fromFile.name,
                description: fromFile.description,
                parameters: fromFile.parameters,
                version: fromFile.version
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

              assertValidParameters(file, propertiesFile, properties, template);
            } else {
              trackWarning(
                `Missing properties file ${underline(
                  propertiesFile
                )} for template ${underline(file)}`
              );
            }

            const markdown = generate(
              data,
              {
                ...properties,
                ...meta,
                filePath: file
              },
              generateOptions
            );
            await writeAsync(path(outputDir, `${file}.md`), markdown);
          })
      );
    } catch (e) {
      trackError(e.message);
    }

    if (hadErrors) {
      process.exit(1);
    }
  }
};
