import '@fontsource-variable/inter';
import '@fontsource-variable/literata';
import '@fontsource-variable/literata/wght-italic.css';
import './style.css';

import { h } from './lib/dom.ts';
import { CONTRIBUTING_URL, REPO_URL } from './lib/config.ts';
import { t } from './lib/i18n.ts';
import type { Key } from './lib/i18n.ts';
import { applyTheme, prefs, setPref } from './lib/store.ts';
import type { Theme } from './lib/store.ts';
import { errorBox } from './views/components.ts';
import { languageSwitcher } from './views/langswitch.ts';
import { closePopover } from './views/popover.ts';
import { authorView } from './views/author.ts';
import { homeView } from './views/home.ts';
import { learnView } from './views/learn.ts';
import { progressView } from './views/progress.ts';
import { wordsView } from './views/words.ts';
import { workView } from './views/work.ts';

const NAV: Array<{ route: string; key: Key }> = [
  { route: '', key: 'nav.library' },
  { route: 'learn', key: 'nav.learn' },
  { route: 'words', key: 'nav.words' },
  { route: 'progress', key: 'nav.progress' },
];
const THEMES: Theme[] = ['auto', 'light', 'dark'];

// Static markup: a stylised "rozha" diamond from Belarusian embroidery.
const MARK = `<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 2 30 16 16 30 2 16Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 9 23 16 16 23 9 16Z" fill="currentColor"/></svg>`;

const view = h('main', { id: 'main', tabindex: '-1' });
let navToken = 0;

function header(): HTMLElement {
  const brandMark = h('span', { class: 'brand__mark' });
  brandMark.innerHTML = MARK;

  return h(
    'header',
    { class: 'site-header' },
    h(
      'div',
      { class: 'site-header__inner' },
      h('a', { class: 'brand', href: '#/' }, brandMark, h('span', { class: 'brand__name' }, t('brand'))),
      h(
        'nav',
        { class: 'nav', 'aria-label': 'Main' },
        NAV.map(({ route, key }) => h('a', { class: 'nav__link', href: `#/${route}`, 'data-route': route }, t(key))),
        h('a', { class: 'nav__link', href: CONTRIBUTING_URL, target: '_blank', rel: 'noopener' }, `${t('nav.contribute')} ↗`),
      ),
      h(
        'div',
        { class: 'site-header__tools' },
        languageSwitcher((l) => {
          document.documentElement.lang = l;
          build();
        }),
        h(
          'button',
          {
            type: 'button',
            class: 'icon-btn',
            title: t('theme.label'),
            onclick: () => {
              setPref('theme', THEMES[(THEMES.indexOf(prefs.theme) + 1) % THEMES.length]);
              build();
            },
          },
          `◐ ${t(`theme.${prefs.theme}`)}`,
        ),
      ),
    ),
    h('div', { class: 'ornament', 'aria-hidden': 'true' }),
  );
}

function footer(): HTMLElement {
  return h(
    'footer',
    { class: 'site-footer' },
    h('div', { class: 'ornament', 'aria-hidden': 'true' }),
    h('p', {}, t('footer.license')),
    h('p', {}, h('a', { class: 'link', href: REPO_URL, target: '_blank', rel: 'noopener' }, `${t('footer.source')} ↗`)),
  );
}

function highlightNav(path: string): void {
  const section = path.split('/')[0];
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.nav__link[data-route]')) {
    const current = link.dataset.route === section || (link.dataset.route === '' && (section === 'author' || section === 'work'));
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

async function resolve(path: string): Promise<HTMLElement> {
  let m: RegExpMatchArray | null;
  if (path === '') return homeView();
  if (path === 'learn') return learnView();
  if (path === 'words') return wordsView();
  if (path === 'progress') return progressView();
  if ((m = path.match(/^author\/([^/]+)$/))) return authorView(decodeURIComponent(m[1]));
  if ((m = path.match(/^work\/([^/]+)\/([^/]+)$/))) return workView(decodeURIComponent(m[1]), decodeURIComponent(m[2]));
  return homeView();
}

async function route(): Promise<void> {
  const token = ++navToken;
  const path = location.hash.replace(/^#\/?/, '');
  closePopover();
  highlightNav(path);
  view.setAttribute('aria-busy', 'true');
  view.replaceChildren(h('p', { class: 'loading' }, t('common.loading')));
  try {
    const el = await resolve(path);
    if (token !== navToken) return;
    view.replaceChildren(el);
    window.scrollTo(0, 0);
  } catch (err) {
    if (token !== navToken) return;
    view.replaceChildren(errorBox(err instanceof Error ? err.message : String(err)));
  } finally {
    if (token === navToken) view.removeAttribute('aria-busy');
  }
}

function build(): void {
  const skip = h('a', { class: 'skip', href: '#main', onclick: (e) => { e.preventDefault(); view.focus(); } }, 'Skip to content');
  document.body.replaceChildren(skip, header(), view, footer());
  void route();
}

applyTheme();
document.documentElement.lang = prefs.ui;
window.addEventListener('hashchange', () => void route());
build();
