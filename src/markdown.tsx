import { Fragment, h, type VNodeChild } from "vue";

/** Converts the supported Markdown input into the plain text users see. */
export function markdownToPlainText(source: string) {
  let inCodeFence = false;
  const lines = source.replace(/<!--\s*bymark-page\s*-->/g, "").replace(/\r\n?/g, "\n").split("\n").map((line) => {
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      return "";
    }
    if (inCodeFence) return line;
    if (/^\s*---+\s*$/.test(line)) return "";

    const text = line
      .replace(/^\s*#{1,6}\s+/, "")
      .replace(/^\s*>\s?/, "")
      .replace(/^\s*[-*+•]\s+/, "")
      .replace(/^\s*\d+[.)]\s+/, "");

    return text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/(\*\*|__)([\s\S]+?)\1/g, "$2")
      .replace(/(\*|_)([\s\S]+?)\1/g, "$2")
      .replace(/~~([\s\S]+?)~~/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\\([\\`*_[\]{}()#+\-.!>])/g, "$1");
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** A deliberately small, safe Markdown dialect for deterministic card exports. */
function renderInlineMarkdown(value: string): VNodeChild[] {
  const nodes: VNodeChild[] = [];
  const pattern = /(\*\*|__)([\s\S]+?)\1|(\*|_)([\s\S]+?)\3|`([^`]+)`/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
    if (match[1])
      nodes.push(
        h(
          "strong",
          { key: `strong-${match.index}` },
          renderInlineMarkdown(match[2]),
        ),
      );
    else if (match[3])
      nodes.push(
        h("em", { key: `em-${match.index}` }, renderInlineMarkdown(match[4])),
      );
    else nodes.push(h("code", { key: `code-${match.index}` }, match[5]));
    cursor = pattern.lastIndex;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function inlineLines(lines: string[]) {
  return renderInlineMarkdown(lines.join("\n"));
}

function isBlockStart(line: string) {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*+•]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line) ||
    /^---+$/.test(line)
  );
}

export const MarkdownContent = (props: { source: string }) => {
  const lines = props.source.replace(/<!--\s*bymark-page\s*-->/g, "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: VNodeChild[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      blocks.push(
        h("div", {
          key: `blank-${index}`,
          class: "markdown-blank-line",
          "aria-hidden": "true",
        }),
      );
      index += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push(
        h(
          `h${heading[1].length}`,
          { key: `heading-${index}` },
          renderInlineMarkdown(heading[2]),
        ),
      );
      index += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index]))
        quote.push(lines[index++].replace(/^>\s?/, ""));
      blocks.push(
        h("blockquote", { key: `quote-${index}` }, inlineLines(quote)),
      );
      continue;
    }
    if (/^[-*+•]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+•]\s+/.test(lines[index]))
        items.push(lines[index++].replace(/^[-*+•]\s+/, ""));
      blocks.push(
        h(
          "ul",
          { key: `list-${index}` },
          items.map((item, i) =>
            h("li", { key: `${i}-${item}` }, renderInlineMarkdown(item)),
          ),
        ),
      );
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index]))
        items.push(lines[index++].replace(/^\d+[.)]\s+/, ""));
      blocks.push(
        h(
          "ol",
          { key: `ordered-${index}` },
          items.map((item, i) =>
            h("li", { key: `${i}-${item}` }, renderInlineMarkdown(item)),
          ),
        ),
      );
      continue;
    }
    if (/^---+$/.test(line)) {
      blocks.push(h("hr", { key: `rule-${index++}` }));
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBlockStart(lines[index])
    )
      paragraph.push(lines[index++]);
    blocks.push(h("p", { key: `paragraph-${index}` }, inlineLines(paragraph)));
  }
  return h(Fragment, null, blocks);
};
