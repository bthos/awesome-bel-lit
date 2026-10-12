import { h } from '../lib/dom.ts';
import { getContent, getIndex, getMeta } from '../lib/data.ts';
import { LANGUAGES, newTranslationUrl } from '../lib/config.ts';
import { t } from '../lib/i18n.ts';
import { authorName } from './components.ts';

export async function progressView(): Promise<HTMLElement> {
  document.title = `${t('progress.title')} · ${t('brand')}`;
  const index = await getIndex();
  const rows = index.authors.flatMap((author) => author.works.map((work) => ({ author, work })));

  // Translator credits live in the per-language JSON, not the index.
  const details = await Promise.all(
    rows.map(async ({ author, work }) => {
      const meta = await getMeta(author.id, work.id);
      const texts = await Promise.all(work.available_languages.map((l) => getContent(author.id, work.id, l)));
      const credits = Object.fromEntries(work.available_languages.map((l, i) => [l, texts[i]?.translator ?? '']));
      return { original: meta?.original_language ?? 'be', credits };
    }),
  );

  const total = rows.length * LANGUAGES.length;
  const filled = rows.reduce((n, r) => n + r.work.available_languages.length, 0);

  const table = h(
    'table',
    { class: 'matrix' },
    h(
      'thead',
      {},
      h('tr', {}, h('th', { scope: 'col' }, t('progress.work')), LANGUAGES.map((l) => h('th', { scope: 'col', title: l.english }, l.code.toUpperCase()))),
    ),
    h(
      'tbody',
      {},
      rows.map(({ author, work }, i) =>
        h(
          'tr',
          {},
          h('th', { scope: 'row' }, h('a', { href: `#/work/${author.id}/${work.id}`, lang: 'be' }, work.titles?.be ?? work.id), h('span', { class: 'muted' }, authorName(author))),
          LANGUAGES.map((l) => {
            const { original, credits } = details[i];
            if (l.code === original) return h('td', { class: 'cell cell--original' }, t('progress.original'));
            if (work.available_languages.includes(l.code)) {
              return h('td', { class: 'cell cell--done', title: credits[l.code] }, '✓', credits[l.code] && h('span', { class: 'cell__who' }, credits[l.code]));
            }
            return h('td', { class: 'cell' }, h('a', { class: 'cell__add', href: newTranslationUrl(author.id, work.id, l.code), target: '_blank', rel: 'noopener', 'aria-label': `${t('progress.contribute')} ${l.english}` }, '+'));
          }),
        ),
      ),
    ),
  );

  return h(
    'div',
    { class: 'progress' },
    h('h1', { class: 'page-title' }, t('progress.title')),
    h('p', { class: 'lead' }, t('progress.lead')),
    h('p', { class: 'muted' }, `${filled} / ${total} · ${total ? Math.round((filled / total) * 100) : 0}% ${t('progress.coverage')}`),
    h('div', { class: 'table-wrap' }, table),
  );
}
