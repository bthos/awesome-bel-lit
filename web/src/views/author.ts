import { h } from '../lib/dom.ts';
import { getAuthor, getIndex, pick } from '../lib/data.ts';
import { t } from '../lib/i18n.ts';
import { prefs } from '../lib/store.ts';
import { authorName, errorBox, initials, workCard } from './components.ts';

export async function authorView(id: string): Promise<HTMLElement> {
  const [index, info] = await Promise.all([getIndex(), getAuthor(id)]);
  const entry = index.authors.find((a) => a.id === id);
  if (!info || !entry) return errorBox(t('author.notFound'));

  const langs = [prefs.ui, 'en', 'be'];
  const name = authorName(entry);
  const wiki = pick(info.external_links?.wikipedia, langs);
  const bioLang = langs.find((l) => info.biography[l]) ?? 'en';
  document.title = `${name} · ${t('brand')}`;

  const years = info.death_year ? `${info.birth_year}–${info.death_year}` : `${t('author.born')} ${info.birth_year}`;
  const shown = new Set<string>([name]); // collapse identical spellings across languages

  return h(
    'div',
    { class: 'author' },
    h(
      'header',
      { class: 'author__head' },
      info.image_url
        ? h('img', { class: 'avatar avatar--lg', src: info.image_url, alt: '' })
        : h('span', { class: 'avatar avatar--lg', 'aria-hidden': 'true' }, initials(info.names.be ?? name)),
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, name),
        h('p', { class: 'muted' }, years),
        // Other-script spellings of the name help learners connect forms.
        h(
          'p',
          { class: 'muted names' },
          Object.entries(info.names)
            .filter(([, n]) => !shown.has(n) && shown.add(n))
            .map(([l, n]) => h('span', { lang: l }, n)),
        ),
      ),
    ),
    h('p', { class: 'prose', lang: bioLang }, info.biography[bioLang]),
    wiki && h('p', {}, h('a', { class: 'link', href: wiki, rel: 'noopener', target: '_blank' }, `${t('author.wiki')} ↗`)),
    h('h2', { class: 'section__title' }, t('author.works')),
    h('div', { class: 'grid' }, entry.works.map((w) => workCard(entry, w))),
  );
}
