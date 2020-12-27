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
import { safeDump as stringifyYaml } from 'js-yaml';

const globAsync = promisify(glob);

function frontmatter(data: any) {
  return '---\n' + stringifyYaml(data) + '\n---\n';
}

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox: GluegunToolbox) => {
  toolbox.generateDocs = async (outDir?: string) => {
    const {
      parameters: { array: patterns, options },
      filesystem: { writeAsync, readAsync, path, dirAsync }
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

    function getDescriptionFromYamlCommentBlock(data: string) {
      const lines = data.split('\n');
      let blockLines: string[] = [];
      let line: string;
      line = lines.shift().trim();
      while (line.startsWith('#')) {
        blockLines.push(line.substring(1).trim());
        line = lines.shift().trim();
      }
      return blockLines.length > 0 ? blockLines.join('\n') : undefined;
    }

    const templateDocs = await Promise.all(
      files
        .filter(file => file.endsWith('.yml') || file.endsWith('yaml'))
        .map(async file => {
          const data = await readAsync(file);
          const name = basename(file, file.substring(file.indexOf('.')));
          return (
            frontmatter({ title: name, layout: 'docs.njk' }) +
            generate(
              data,
              {
                ...meta,
                name: name,
                description: getDescriptionFromYamlCommentBlock(data),
                filePath: file
              },
              generateOptions
            )
          );
        })
    );

    // const projectName = options.projectName ?? gitUrl.name;

    outDir = outDir ?? '.';

    await dirAsync(outDir);
    await Promise.all(
      templateDocs.map((doc, i) => writeAsync(path(outDir, `doc${i}.md`), doc))
    );
  };
};
