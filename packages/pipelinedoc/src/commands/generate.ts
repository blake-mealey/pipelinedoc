import { GluegunToolbox } from 'gluegun';
import {
  generate,
  GenerateOptions,
  RepoMetaData,
  TemplateMetaData
} from 'az-pipelines-documenter';
import { glob } from 'glob';
import { promisify } from 'util';
import { basename } from 'path';
import simpleGit from 'simple-git/promise';
import GitUrlParse from 'git-url-parse';

const globAsync = promisify(glob);

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: { error },
      parameters: { array: patterns, options },
      filesystem: { writeAsync, readAsync, path, exists }
    } = toolbox;

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

    const ensureProperties = options.ensureProperties;

    try {
      await Promise.all(
        files
          .filter(file => file.endsWith('.yml') || file.endsWith('yaml'))
          .map(async file => {
            const data = await readAsync(file);

            let properties = {
              name: basename(file.substring(0, file.lastIndexOf('.')))
            };

            const propertiesFile =
              file.substring(0, file.lastIndexOf('.')) + '.properties.json';
            if (exists(propertiesFile) === 'file') {
              properties = JSON.parse(await readAsync(propertiesFile));
            } else {
              if (ensureProperties) {
                throw new Error(
                  `Missing expected properties file ${propertiesFile} because --ensure-properties was specified.`
                );
              }
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
      error(e.message);
    }
  }
};
