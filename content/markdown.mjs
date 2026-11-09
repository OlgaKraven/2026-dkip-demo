import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { parseFragment, serialize } from 'parse5';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const md = new MarkdownIt({
  html: true,
  highlight(code, language) {
    return hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : '';
  },
});
const fence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, index, options, env, renderer) => {
  const token = tokens[index];
  if (token.info.trim() === 'mermaid') {
    return `<div class="scroll-box diagram" tabindex="0"><pre class="mermaid">${escapeHtml(token.content)}</pre></div>`;
  }
  return `<div class="code-block"><button class="copy-code" type="button">Копировать</button>${fence(tokens, index, options, env, renderer)}</div>`;
};

function normalize(markdown) {
  let inFence = false;
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').split(/(\n)/).map((line, i, parts) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) return line;
    if (/^\s*\/\/\/ caption\s*$/.test(line) && /^\s*\/\/\/\s*$/.test(parts[i + 4] ?? '')) {
      const caption = parts[i + 2].trim();
      parts[i + 2] = '';
      parts[i + 4] = '';
      return `${line.match(/^\s*/)[0]}<p class="figure-caption">${md.renderInline(escapeHtml(caption))}</p>`;
    }
    const note = line.match(/^!!! info "([^"]+)"$/);
    if (note) {
      const lines = [`> **${note[1]}**`, '>'];
      for (let next = i + 2; /^( {4}|\t)/.test(parts[next] ?? ''); next += 2) {
        lines.push(`> ${parts[next].replace(/^( {4}|\t)/, '')}`);
        parts[next] = '';
      }
      return lines.join('\n');
    }
    return line.replace(/\s*\{\s*\.md-button\s*\}\s*$/, '');
  }).join('');
}

const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'base', 'form', 'input', 'meta', 'link']);

function transform(node) {
  if (!node.childNodes) return;
  node.childNodes = node.childNodes.filter(child => !blockedTags.has(child.tagName));
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.attrs) {
      child.attrs = child.attrs.filter(({ name, value }) => {
        if (name.startsWith('on') || name === 'style' || name === 'srcdoc') return false;
        return !['href', 'src', 'xlink:href'].includes(name) || !/^(?:javascript|vbscript|data):/i.test(value.replace(/\s/g, ''));
      });
      if (child.tagName === 'a') {
        const href = child.attrs.find(attr => attr.name === 'href');
        if (href && !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(href.value)) {
          href.value = href.value.replace(/\.md(?=[?#]|$)/i, '.html');
          if (/\.(?:rar|zip|sql|docx|xlsx|pdf|json|exe|jar)(?:[?#]|$)/i.test(href.value)) {
            child.attrs.push({ name: 'class', value: 'file-link' });
          }
        }
      }
      if (child.tagName === 'img' && !child.attrs.some(attr => attr.name === 'loading')) {
        child.attrs.push({ name: 'loading', value: 'lazy' });
      }
      if (child.tagName === 'table') {
        const wrapper = parseFragment('<div class="scroll-box" tabindex="0" role="region" aria-label="Таблица"></div>').childNodes[0];
        wrapper.childNodes.push(child);
        wrapper.parentNode = node;
        child.parentNode = wrapper;
        node.childNodes[i] = wrapper;
      }
    }
    transform(child);
  }
}

function plainText(node) {
  if (node.nodeName === '#text') return node.value;
  if (node.tagName === 'pre' || node.tagName === 'button') return '';
  return (node.childNodes ?? []).map(plainText).join(' ');
}

export function renderMarkdown(source) {
  const env = {};
  const tokens = md.parse(normalize(source), env);
  const usedIds = new Set();
  const headings = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'heading_open') continue;
    const token = tokens[i + 1];
    const attribute = token.content.match(/\s*\{\s*#([^}\s]+)\s*\}$/);
    if (attribute) {
      token.content = token.content.slice(0, attribute.index);
      token.children = md.parseInline(token.content, env)[0].children;
    }
    const text = token.children.map(child => child.content).join('').trim();
    const base = attribute?.[1] || text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'раздел';
    let id = base;
    for (let suffix = 2; usedIds.has(id); suffix++) id = `${base}-${suffix}`;
    usedIds.add(id);
    tokens[i].attrSet('id', id);
    headings.push({ id, text, level: Number(tokens[i].tag[1]) });
  }

  const doc = parseFragment(md.renderer.render(tokens, md.options, env));
  transform(doc);
  const title = headings.find(heading => heading.level === 1)?.text;
  const titleIndex = doc.childNodes.findIndex(node => node.tagName === 'h1');
  if (titleIndex >= 0) doc.childNodes.splice(titleIndex, 1);
  return { title, headings: headings.filter(heading => heading.level > 1), html: serialize(doc), text: plainText(doc).replace(/\s+/g, ' ').trim() };
}
