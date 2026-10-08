import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { marked, Marked } from 'marked';

export const source = readFileSync(resolve('content/informe.md'), 'utf8');
const visuals = JSON.parse(readFileSync(resolve('content/visuales.json'), 'utf8'));
export const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');

export function renderReport(base = '/') {
  const asset = (path) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const sections = [], figures = [], tables = [], subheadings = [];
  const used = new Map();
  const unique = (title) => { const id = slug(title); const count = used.get(id) || 0; used.set(id, count + 1); return count ? `${id}-${count}` : id; };
  let section = null, skipped = false, tableCount = 0;
  const renderer = {
    heading({ depth, text, tokens }) {
      const id = unique(text);
      subheadings.push({ id, title: text, section: section.id });
      return `<h${depth} id="${escape(id)}">${this.parser.parseInline(tokens)}<a class="heading-link" href="#${escape(id)}" aria-label="Enlace a ${escape(text)}">#</a></h${depth}>`;
    },
    table(token) {
      const number = ++tableCount;
      const title = visuals.tables[number - 1] || section.title;
      const id = `tabla-${number}`;
      tables.push({ id, title, number, section: section.id, columns: token.header.length, rows: token.rows.map((row) => row.map((cell) => cell.text)) });
      const row = (cells, tag) => `<tr>${cells.map((cell, i) => `<${tag}${tag === 'th' ? ' scope="col"' : ''}${token.align[i] ? ` class="align-${token.align[i]}"` : ''}>${this.parser.parseInline(cell.tokens)}</${tag}>`).join('')}</tr>`;
      return `<div class="table-block" id="${id}"><div class="table-scroll" tabindex="0" role="region" aria-label="Tabla ${number}. ${escape(title)}"><table class="${token.header.length > 5 ? 'wide-table' : ''}"><caption><span class="object-number">Tabla ${number}</span> ${escape(title)}<a class="heading-link" href="#${id}" aria-label="Enlace a la tabla ${number}">#</a></caption><thead>${row(token.header, 'th')}</thead><tbody>${token.rows.map((cells) => row(cells, 'td')).join('')}</tbody></table></div><span class="table-hint">Desplaza la tabla para ver todas las columnas <span aria-hidden="true">↔</span></span></div>`;
    },
    link({ href, title, tokens }) {
      const external = /^https?:\/\//.test(href);
      return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ''}${external ? ' rel="noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
    },
  };
  const parser = new Marked({ gfm: true, renderer });
  const tokens = marked.lexer(source);
  const title = tokens.find((token) => token.type === 'heading' && token.depth === 1).text;
  const date = tokens.find((token) => token.type === 'paragraph').text;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading' && token.depth === 1) continue;
    if (token.type === 'heading' && token.depth === 2) {
      skipped = token.text === 'Índice';
      if (skipped) continue;
      section = { title: token.text, id: unique(token.text), html: '' };
      sections.push(section);
      continue;
    }
    if (!section || skipped) continue;
    const match = token.type === 'paragraph' && token.raw.trim().match(/^!\[(.*)\]\(([^)]+)\)$/);
    if (match) {
      const number = figures.length + 1;
      const meta = visuals.figures[number - 1];
      const id = `figura-${number}`;
      const path = asset(match[2]);
      const figure = { id, title: meta.title, number, section: section.id, path };
      figures.push(figure);
      let caption = '';
      let next = i + 1;
      while (tokens[next]?.type === 'space') next++;
      if (tokens[next]?.type === 'paragraph' && /^\*Fuente:/.test(tokens[next].raw.trim())) {
        caption = parser.parser([tokens[next]]);
        i = next;
      }
      section.html += `<figure id="${id}" class="report-figure"><figcaption><span class="object-number">Figura ${number}</span> ${escape(meta.title)}<a class="heading-link" href="#${id}" aria-label="Enlace a la figura ${number}">#</a></figcaption><a class="figure-open" href="${escape(path)}" data-figure="${number}" aria-label="Ampliar figura ${number}: ${escape(meta.title)}"><img src="${escape(path)}" alt="${escape(meta.title + '. ' + match[1])}" width="${meta.width}" height="${meta.height}" loading="lazy" decoding="async"/><span class="enlarge"><span aria-hidden="true">↗</span> Ampliar gráfico</span></a><div class="figure-source">${caption}</div></figure>`;
      continue;
    }
    section.html += parser.parser([token]);
  }
  if (figures.length !== visuals.figures.length || tables.length !== visuals.tables.length) throw new Error('La lista de visuales no coincide con el Markdown. Revisa content/visuales.json.');
  return { title, date, sections, figures, tables, subheadings, asset };
}
