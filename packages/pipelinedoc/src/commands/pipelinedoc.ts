import { GluegunCommand } from 'gluegun';

const command: GluegunCommand = {
  name: 'pipelinedoc',
  run: async toolbox => {
    const { print } = toolbox;

    print.printHelp(toolbox);
  }
};

module.exports = command;
