import { GluegunToolbox } from 'gluegun';
import {
  generate,
  GenerateOptions,
  TemplateMetaData,
} from 'az-pipelines-documenter';
import { glob } from 'glob';
import { promisify } from 'util';
import { basename } from 'path';

const globAsync = promisify(glob);

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters: { array: patterns, options },
      filesystem: { writeAsync, readAsync },
    } = toolbox;

    // Load options
    const repoIdentifier: string = options.repoIdentifier ?? 'templates';
    const projectName: string | undefined = options.projectName;

    const files = (
      await Promise.all(
        patterns.map((pattern) =>
          globAsync(pattern, {
            ignore: ['node_modules', '.git'],
          })
        )
      )
    ).flat();

    const generateOptions: Partial<GenerateOptions> = {
      headingDepth: 2,
    };

    const meta: Partial<TemplateMetaData> = {
      repo: {
        identifier: repoIdentifier,
        name: 'blake-mealey/az-pipelines-documenter',
        type: 'github',
      },
    };

    const markdown = await Promise.all(
      files
        .filter((file) => file.endsWith('.yml') || file.endsWith('yaml'))
        .map(async (file) => {
          return generate(
            await readAsync(file),
            {
              ...meta,
              name: basename(file, file.substring(file.indexOf('.'))),
              filePath: file,
            },
            generateOptions
          );
        })
    );

    await writeAsync('docs.md', `# ${projectName}\n\n` + markdown.join('\n'));
  },
};
