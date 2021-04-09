import yaml from 'js-yaml';

export function heading(text: string, depth: number) {
  return '#'.repeat(depth) + ' ' + text;
}

export function unorderedList(items: string[]) {
  return items.map((item) => '- ' + item).join('\n');
}

export function table([header, ...rows]: string[][]) {
  const formatCell = (cell: string) =>
    cell.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, ' ');
  const formatRow = (row: string[]) => `|${row.map(formatCell).join('|')}|\n`;
  return (
    formatRow(header) +
    formatRow(header.map(() => '---')) +
    rows.map(formatRow).join('')
  );
}

export function link(text: string, href: string) {
  return `[${text}](${href})`;
}

export function code(text?: string) {
  return text ? '`' + text.trim() + '`' : '';
}

export function codeBlock(lang: string, text: string) {
  return '```' + `${lang}\n${text.trim()}\n` + '```';
}

export function indent(spaces: number, text: string) {
  return ' '.repeat(spaces) + text;
}

export function yamlBlock(yamlObject: any) {
  return codeBlock(
    'yaml',
    yaml.dump(yamlObject, {
      skipInvalid: true,
    })
  );
}

export function bold(text: string) {
  return `**${text}**`;
}

export function italics(text: string) {
  return `_${text}_`;
}

export function comment(text: string) {
  return `<!-- ${text} -->`;
}
