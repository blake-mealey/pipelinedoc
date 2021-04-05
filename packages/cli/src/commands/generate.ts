import { GluegunToolbox } from 'gluegun';
import { GenerateOptions, TemplateMetaData } from '../az-pipelines';
import { glob } from 'glob';
import { promisify } from 'util';

const globAsync = promisify(glob);

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters: { array: patterns, options },
      doc: { getRepoDetails, generateDocs, hadErrors }
    } = toolbox;

    const repoDetails = await getRepoDetails();

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

    const outputDir = options.outDir ?? options.o ?? './docs';

    await generateDocs(files, generateOptions, meta, outputDir);

    if (hadErrors()) {
      process.exit(1);
    }
  }
};
