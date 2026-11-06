// A deliberately bounded check of literal HTML/CSS URLs, not a browser or JS parser.
import { readFile } from 'node:fs/promises';
import { problem } from './diagnostics.mjs';

const origin = 'https://static-publish.invalid';
const decode = text => text.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, n) => { const c = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n); return c <= 0x10ffff ? String.fromCodePoint(c) : ''; });
function attrs(text) {
  return [...text.matchAll(/(?:^|\s)([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4])]);
}
function cssURLs(text) {
  const urls = []; let i = 0;
  function escape() {
    i++;
    if (/[\r\n\f]/.test(text[i] || '')) { if (text[i] === '\r' && text[i + 1] === '\n') i++; i++; return ''; }
    const hex = text.slice(i).match(/^[a-f0-9]{1,6}/i)?.[0];
    if (hex) { i += hex.length; if (/\s/.test(text[i] || '')) i++; const n = parseInt(hex, 16); return String.fromCodePoint(n && n <= 0x10ffff ? n : 0xfffd); }
    return text[i++] || '';
  }
  function quoted() {
    const quote = text[i++]; let value = '';
    while (i < text.length && text[i] !== quote) value += text[i] === '\\' ? escape() : text[i++];
    if (text[i] === quote) i++;
    return value;
  }
  function space() {
    for (;;) {
      while (/\s/.test(text[i] || '')) i++;
      if (text.slice(i, i + 2) !== '/*') return;
      const end = text.indexOf('*/', i + 2); i = end < 0 ? text.length : end + 2;
    }
  }
  while (i < text.length) {
    if (/\s/.test(text[i]) || text.slice(i, i + 2) === '/*') { space(); continue; }
    if (text[i] === '"' || text[i] === "'") { quoted(); continue; }
    const imported = text.slice(i).match(/^@import\b/i);
    if (imported) {
      i += imported[0].length; space();
      if (text[i] === '"' || text[i] === "'") urls.push(quoted());
      continue;
    }
    const url = !/[\w-]/.test(text[i - 1] || '') && text.slice(i).match(/^url\s*\(/i);
    if (url) {
      i += url[0].length; space(); let value = '';
      if (text[i] === '"' || text[i] === "'") { value = quoted(); space(); }
      else while (i < text.length && text[i] !== ')') value += text[i] === '\\' ? escape() : text[i++];
      if (text[i] === ')') { i++; urls.push(value.trim()); }
      continue;
    }
    i++;
  }
  return urls;
}
export async function checkReferences(files, readSource) {
  const selected = new Set(files.flatMap(f => ['/' + f.source, decodeURIComponent(f.url), ...(f.source.endsWith('/index.html') ? [decodeURIComponent(f.url).replace(/\/$/, '')] : [])]));
  const missing = [], external = new Set(), manual = new Set(); let checked = 0;
  function check(source, raw, base) {
    raw = raw.trim();
    if (!raw || raw.startsWith('#') || /^(?:data|blob|mailto|tel|javascript):/i.test(raw)) return;
    if (/\{\{asset:/.test(raw)) throw problem('UNRENDERED_ASSET', 'HTML 仍有未接入的资源占位符。', '先运行 resources.mjs render 消费资源清单，再冻结页面。');
    if (/\$\{|\{\{|\\/.test(raw)) { manual.add(source); return; }
    let url;
    try { url = new URL(raw, base); } catch { throw problem('INVALID_REFERENCE', '页面包含无法解析的字面引用。', '修正 HTML/CSS URL 后再生成快照。'); }
    if (!['https:', 'http:'].includes(url.protocol)) return;
    if (url.origin !== origin) { external.add(url.origin); return; }
    let path;
    try { path = decodeURIComponent(url.pathname); } catch { throw problem('INVALID_REFERENCE', '引用的 URL 编码无效。', '修正百分号编码后再生成快照。'); }
    checked++;
    if (!selected.has(path)) missing.push({ source, path });
  }
  for (const file of files) {
    if (!['text/html', 'text/css'].includes(file.contentType)) {
      if (/javascript/.test(file.contentType)) manual.add(file.source);
      continue;
    }
    const text = await readSource(file.source);
    let base = new URL(file.url, origin);
    if (file.contentType === 'text/css') { for (const ref of cssURLs(text)) check(file.source, ref, base); continue; }
    const styles = [];
    const html = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|textarea|title|xmp|iframe|noembed|noframes|noscript)\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/\1\s*>/gi, (_, tag, attributes, body) => {
      if (tag.toLowerCase() === 'style') styles.push(body);
      if (['script', 'noscript'].includes(tag.toLowerCase())) manual.add(file.source);
      return `<${tag}${attributes}></${tag}>`;
    });
    const tags = [...html.matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)].map(m => ({ name: m[1].toLowerCase(), attrs: attrs(m[2]) }));
    const bases = tags.filter(t => t.name === 'base').flatMap(t => t.attrs.filter(([k]) => k === 'href').map(([, v]) => v));
    if (bases.length > 1) throw problem('AMBIGUOUS_BASE', '页面有多个 base href，无法可靠预检。', '修正为一个明确 base 或在原项目构建中核对依赖。');
    if (bases.length) { try { base = new URL(bases[0], base); } catch { throw problem('INVALID_REFERENCE', 'base href 无效。', '修正 HTML 的 base 地址。'); } }
    for (const tag of tags) {
      if (tag.name === 'script') manual.add(file.source);
      for (const [key, value] of tag.attrs) {
        if (tag.name === 'base' && key === 'href') continue;
        if (['src', 'href', 'poster'].includes(key)) check(file.source, value, base);
        if (key === 'style') for (const ref of cssURLs(value)) check(file.source, ref, base);
        if (key === 'srcset') {
          if (/\b(?:data|blob):/i.test(value)) manual.add(file.source);
          else for (const part of value.split(',')) check(file.source, part.trim().split(/\s+/)[0], base);
        }
      }
    }
    for (const style of styles) for (const ref of cssURLs(style)) check(file.source, ref, base);
  }
  if (missing.length) throw problem('MISSING_REFERENCE', `引用未进入公开清单：${missing.slice(0, 12).map(x => `${x.source} → ${x.path}`).join('；')}`, '把确认可公开的依赖显式加入 files，或修正引用；不要递归公开整个工程。');
  return { scope: 'literal HTML/CSS URLs', checked, externalOrigins: [...external].sort(), manualReview: [...manual].sort(), dynamicPathsChecked: false, browserRequired: true };
}
