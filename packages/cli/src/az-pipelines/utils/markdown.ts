export function heading(text: string, depth: number) {
  return '#'.repeat(depth) + ' ' + text;
}

export function unorderedList(items: string[]) {
  return items.map((item) => '- ' + item).join('\n');
}

export function link(text: string, href?: string) {
  return `[${text}](${href ?? text})`;
}

export function code(text?: string) {
  return text ? '`' + text.trim() + '`' : '';
}

export function bold(text: string) {
  return `**${text}**`;
}

export function comment(text: string) {
  return `<!-- ${text} -->`;
}
