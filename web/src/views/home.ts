import { h } from '../lib/dom.ts';
import { getContent, getIndex } from '../lib/data.ts';
import { t } from '../lib/i18n.ts';
import { toLacinka } from '../lib/translit.ts';
import { prefs } from '../lib/store.ts';
import type { CorpusIndex, IndexAuthor, IndexWork, Stanza } from '../lib/types.ts';
import { authorName, initials, typeLabel, workCard } from './components.ts';

/** First stanza of the first work, original + Łacinka + translation: a live demo of the reader. */
async function specimen(author: IndexAuthor, work: IndexWork): Promise<HTMLElement | null> {
  const original = await getContent(author.id, work.id, 'be');
  const first = original?.content[0];
  if (!original || first?.type !== 'stanza') return null;
  const translationLang = work.available_languages.includes(prefs.trans) ? prefs.trans : work.available_languages.find((l) => l !== 'be');
  const translation = translationLang ? await getContent(author.id, work.id, translationLang) : null;
  const second = translation?.content[0] as Stanza | undefined;

  return h(
    'a',
    { class: 'specimen', href: `#/work/${author.id}/${work.id}`, 'aria-label': original.title },
    h('p', { class: 'specimen__label' }, `${original.title} · ${authorName(author)}`),
    h(
      'div',
      { class: 'specimen__lines', lang: 'be' },
      first.lines.map((line) =>
        h('p', { class: 'specimen__line' }, h('span', {}, line), h('span', { class: 'specimen__lat' }, toLacinka(line))),
      ),
    ),
    second &&
      h(
        'div',
        { class: 'specimen__trans', lang: translation?.language },
        second.lines.map((line) => h('p', {}, line)),
      ),
  );
}

function library(index: CorpusIndex): HTMLElement {
  const entries = index.authors.flatMap((a) => a.works.map((w) => ({ author: a, work: w })));
  const types = [...new Set(entries.map((e) => e.work.type))];
  const state = { q: '', type: '', lang: '' };

  const results = h('div', { class: 'grid' });
  const chipRow = h('div', { class: 'filters' });

  function matches(author: IndexAuthor, work: IndexWork): boolean {
    if (state.type && work.type !== state.type) return false;
    if (state.lang && !work.available_languages.includes(state.lang)) return false;
    const q = state.q.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      ...Object.values(work.titles ?? {}),
      ...Object.values(author.name),
      ...Object.values(work.tags ?? {}).flat(),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  }

  function paintResults(): void {
    const hits = entries.filter((e) => matches(e.author, e.work));
    results.replaceChildren(
      ...(hits.length > 0
        ? hits.map((e) => workCard(e.author, e.work))
        : [h('p', { class: 'empty' }, t('library.empty'))]),
    );
  }

  function filterGroup(label: string, values: string[], key: 'type' | 'lang', render: (v: string) => string): HTMLElement {
    const options = ['', ...values];
    return h(
      'div',
      { class: 'chips chips--filter', role: 'group', 'aria-label': label },
      options.map((v) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip--button',
            'aria-pressed': state[key] === v,
            onclick: () => {
              state[key] = v;
              paintFilters();
              paintResults();
            },
          },
          v === '' ? t('library.all') : render(v),
        ),
      ),
    );
  }

  function paintFilters(): void {
    chipRow.replaceChildren(
      ...(types.length > 1 ? [filterGroup(t('library.title'), types, 'type', typeLabel)] : []),
      ...(index.statistics.languages_with_content.length > 1
        ? [filterGroup(t('library.language'), index.statistics.languages_with_content, 'lang', (l) => l.toUpperCase())]
        : []),
    );
  }

  const search = h('input', {
    class: 'search',
    type: 'search',
    placeholder: t('library.search'),
    'aria-label': t('library.search'),
    oninput: (e) => {
      state.q = (e.target as HTMLInputElement).value;
      paintResults();
    },
  });

  paintFilters();
  paintResults();
  return h('section', { class: 'section', id: 'library' }, h('h2', { class: 'section__title' }, t('library.title')), h('div', { class: 'toolbar-row' }, search, chipRow), results);
}

function authorsStrip(index: CorpusIndex): HTMLElement {
  return h(
    'section',
    { class: 'section' },
    h('h2', { class: 'section__title' }, t('authors.title')),
    h(
      'div',
      { class: 'grid grid--authors' },
      index.authors.map((a) =>
        h(
          'a',
          { class: 'card author-card', href: `#/author/${a.id}` },
          h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials(a.name.be ?? authorName(a))),
          h('span', { class: 'author-card__text' }, h('strong', {}, authorName(a)), h('span', {}, `${t('authors.works')}: ${a.works_count}`)),
        ),
      ),
    ),
  );
}

export async function homeView(): Promise<HTMLElement> {
  document.title = t('brand');
  const index = await getIndex();
  const firstAuthor = index.authors.find((a) => a.works.length > 0);
  const firstWork = firstAuthor?.works[0];
  const demo = firstAuthor && firstWork ? await specimen(firstAuthor, firstWork) : null;
  const stats = index.statistics;

  return h(
    'div',
    { class: 'home' },
    h(
      'section',
      { class: 'hero' },
      h(
        'div',
        { class: 'hero__copy' },
        h('p', { class: 'eyebrow' }, t('home.eyebrow')),
        h('h1', { class: 'hero__title' }, t('home.title')),
        h('p', { class: 'hero__lead' }, t('home.lead')),
        h(
          'div',
          { class: 'hero__actions' },
          firstAuthor && firstWork && h('a', { class: 'btn btn--primary', href: `#/work/${firstAuthor.id}/${firstWork.id}` }, t('home.cta.read')),
          h('a', { class: 'btn', href: '#/learn' }, t('home.cta.learn')),
        ),
        h(
          'dl',
          { class: 'stats' },
          [
            [stats.total_authors, t('stat.authors')],
            [stats.total_works, t('stat.works')],
            [stats.total_translations, t('stat.translations')],
            [stats.languages_with_content.length, t('stat.languages')],
          ].map(([n, label]) => h('div', {}, h('dt', {}, n), h('dd', {}, label))),
        ),
      ),
      demo,
    ),
    h(
      'section',
      { class: 'section' },
      h('h2', { class: 'section__title' }, t('home.steps')),
      h(
        'ol',
        { class: 'steps' },
        (['1', '2', '3'] as const).map((n) =>
          h('li', { class: 'step' }, h('span', { class: 'step__n' }, n), h('h3', {}, t(`step.${n}.title`)), h('p', {}, t(`step.${n}.body`))),
        ),
      ),
    ),
    library(index),
    authorsStrip(index),
  );
}
