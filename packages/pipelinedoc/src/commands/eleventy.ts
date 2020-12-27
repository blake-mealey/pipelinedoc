import { GluegunToolbox } from 'gluegun';
import Eleventy from '@11ty/eleventy';

module.exports = {
  name: 'eleventy',
  run: async (toolbox: GluegunToolbox) => {
    const {
      meta: { src },
      filesystem: { path },
      parameters: {
        options: { watch, serve, output, port }
      }
    } = toolbox;

    if (!src) {
      return;
    }

    const eleventyDir = path(src, '_eleventy');

    await toolbox.generateDocs(eleventyDir);

    const eleventy = new Eleventy(eleventyDir, output ?? './_site', {
      quietMode: true
    });

    eleventy.setFormats(['md', 'css', 'js'].join(','));

    eleventy.init().then(() => {
      if (serve) {
        eleventy.watch().then(() => {
          eleventy.serve(port);
        });
      } else if (watch) {
        eleventy.watch();
      } else {
        eleventy.write();
      }
    });
  }
};
