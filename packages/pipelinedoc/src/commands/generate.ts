import { GluegunToolbox } from 'gluegun';

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    await toolbox.generateDocs();
  }
};
