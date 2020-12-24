const documenter = require('../dist/index');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  const dirPath = 'fixtures';

  const files = (await fs.readdir(dirPath)).filter(file =>
    file.endsWith('.yml')
  );

  const docs = await Promise.all(
    files.map(async file => {
      const filePath = path.join(dirPath, file);
      const data = await fs.readFile(filePath, {
        encoding: 'utf-8',
      });
      const markdown = documenter.generate(data, {
        name: file,
        version: 1,
        headingDepth: 2,
        templatePath: filePath,
        templateRepo: {
          identifier: 'templates',
          name: 'Project/RepoName',
          type: 'git',
        },
      });
      return markdown;
    })
  );

  const docsString = ['# RepoName Templates', , ...docs].join('\n');
  await fs.writeFile(path.join(dirPath, 'docs.md'), docsString, {
    encoding: 'utf-8',
  });
}

run();
