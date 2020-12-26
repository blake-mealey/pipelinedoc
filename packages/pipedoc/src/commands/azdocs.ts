import { GluegunCommand } from 'gluegun';

const command: GluegunCommand = {
  name: 'pipedoc',
  run: async toolbox => {
    const { print } = toolbox;

    print.printHelp(toolbox);
  }
};

module.exports = command;
