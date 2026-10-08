import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked } from 'marked';
import { source } from '../src/lib/report.mjs';

const html = readFileSync(resolve('dist/index.html'), 'utf8');
const decode = (text) => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code))).replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const plain = (text) => decode(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const pageText = plain(html);
let skip = false, started = false, blocks = 0, figures = 0, tableCount = 0, cells = 0;
for (const token of marked.lexer(source)) {
  if (token.type === 'heading' && token.depth === 2) { skip = token.text === 'Índice'; started = true; }
  if (!started || skip || token.type === 'space') continue;
  if (token.type === 'heading') { assert.ok(pageText.includes(plain(marked.parseInline(token.text))), `Falta el título: ${token.text}`); continue; }
  if (token.type === 'paragraph' && /^!\[/.test(token.raw)) { figures++; continue; }
  if (token.type === 'table') {
    tableCount++;
    for (const row of [token.header, ...token.rows]) for (const cell of row) {
      assert.ok(pageText.includes(plain(marked.parseInline(cell.text))), `Falta celda: ${cell.text}`);
      cells++;
    }
    continue;
  }
  const expected = plain(marked.parser([token]));
  if (expected) { assert.ok(pageText.includes(expected), `Falta contenido: ${expected.slice(0, 100)}`); blocks++; }
}
assert.equal((html.match(/class="report-figure"/g) || []).length, figures);
assert.equal((html.match(/<table\b/g) || []).length, tableCount);
const idList = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1]));
const ids = new Set(idList);
assert.equal(ids.size, idList.length, 'IDs duplicados');
const links = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => decode(match[1]));
for (const link of links.filter((link) => link.startsWith('#'))) assert.ok(ids.has(decodeURIComponent(link.slice(1))), `Ancla rota: ${link}`);
const originalLinks = [...source.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
for (const link of originalLinks) assert.ok(links.includes(link), `Fuente ausente: ${link}`);
let checkedFiles = 0;
for (const path of [...links, ...[...html.matchAll(/\bsrc="([^"]+)"/g)].map((match) => decode(match[1]))]) {
  if (!path || /^https?:|^#|^data:/.test(path)) continue;
  const relative = path.startsWith('/informe-vivienda-spain/') ? path.slice('/informe-vivienda-spain/'.length) : path.replace(/^\//, '');
  assert.ok(existsSync(resolve('dist', relative)), `Archivo ausente: ${path}`);
  checkedFiles++;
}
assert.equal(readFileSync(resolve('dist/descargas/informe.md'), 'utf8'), source, 'La descarga Markdown no corresponde a la fuente');
console.log(JSON.stringify({ paragraphsAndLists: blocks, figures, tables: tableCount, tableCells: cells, sourceLinks: originalLinks.length, internalLinks: links.filter((link) => link.startsWith('#')).length, assetLinks: checkedFiles, status: 'correcto' }, null, 2));
