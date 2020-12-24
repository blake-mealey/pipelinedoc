import { GluegunToolbox } from 'gluegun';
import { generate } from 'az-pipelines-documenter';

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters: { first: name },
      filesystem: { writeAsync, readAsync }
    } = toolbox;

    const file = await readAsync(name);

    const markdown = generate(file, {
      name: name
    });

    await writeAsync(name + '.md', markdown);
  }
};
