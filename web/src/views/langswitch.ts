import { langName } from '../lib/config.ts';
import { h } from '../lib/dom.ts';
import { t } from '../lib/i18n.ts';
import { UI_LANGUAGES } from '../lib/locales.ts';
import { prefs, setPref } from '../lib/store.ts';

/** The language the site teaches: always one tap away, every other language sits in a menu. */
const PRIMARY = 'be';

// Static markup: a globe.
const GLOBE = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>`;

// The menu is a native <details>; these two listeners add the outside-click and Escape dismissal it lacks.
document.addEventListener('click', (e) => {
  for (const menu of document.querySelectorAll<HTMLDetailsElement>('.lang-menu[open]')) {
    if (!menu.contains(e.target as Node)) menu.open = false;
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const menu = document.querySelector<HTMLDetailsElement>('.lang-menu[open]');
  if (!menu) return;
  menu.open = false;
  menu.querySelector('summary')?.focus();
});

export function languageSwitcher(onChange: (lang: string) => void): HTMLElement {
  const choose = (lang: string) => () => {
    setPref('ui', lang);
    onChange(lang);
  };

  const primary = h(
    'button',
    { type: 'button', class: 'lang-be', lang: PRIMARY, title: langName(PRIMARY), 'aria-pressed': prefs.ui === PRIMARY, onclick: choose(PRIMARY) },
    h('span', { class: 'lang-be__full' }, langName(PRIMARY)),
    h('span', { class: 'lang-be__code' }, PRIMARY.toUpperCase()),
  );

  const globe = h('span', { class: 'lang-menu__icon' });
  globe.innerHTML = GLOBE;

  const others = UI_LANGUAGES.filter((l) => l !== PRIMARY);
  const menu =
    others.length > 0 &&
    h(
      'details',
      { class: 'lang-menu' },
      h(
        'summary',
        { class: 'icon-btn lang-menu__btn', title: t('ui.label'), 'aria-label': t('ui.label') },
        globe,
        prefs.ui !== PRIMARY && h('span', { class: 'lang-menu__cur' }, prefs.ui.toUpperCase()),
      ),
      h(
        'ul',
        { class: 'lang-menu__list' },
        others.map((l) =>
          h('li', {}, h('button', { type: 'button', class: 'lang-menu__item', lang: l, 'aria-pressed': prefs.ui === l, onclick: choose(l) }, langName(l))),
        ),
      ),
    );

  return h('div', { class: 'lang-switch', role: 'group', 'aria-label': t('ui.label') }, primary, menu);
}
