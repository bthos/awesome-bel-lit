import { h } from '../lib/dom.ts';
import { pick } from '../lib/data.ts';
import { isKey, t } from '../lib/i18n.ts';
import { isSaved, prefs, toggleWord } from '../lib/store.ts';
import type { SavedWord } from '../lib/store.ts';
import type { IndexAuthor, IndexWork } from '../lib/types.ts';

export function typeLabel(type: string): string {
  const key = `type.${type}`;
  return isKey(key) ? t(key) : type;
}

export function authorName(author: IndexAuthor): string {
  return pick(author.name, [prefs.ui, 'be', 'en']);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function workCard(author: IndexAuthor, work: IndexWork): HTMLElement {
  const original = pick(work.titles, ['be']);
  const other = pick(work.titles, [prefs.ui, prefs.trans, 'en']);
  const gloss = other !== original ? other : '';
  return h(
    'a',
    { class: 'card work-card', href: `#/work/${author.id}/${work.id}` },
    h('div', { class: 'work-card__meta' }, typeLabel(work.type), work.year ? ` · ${work.year}` : ''),
    h('h3', { class: 'work-card__title', lang: 'be' }, original),
    gloss && h('p', { class: 'work-card__gloss' }, gloss),
    h('p', { class: 'work-card__author' }, authorName(author)),
    h(
      'div',
      { class: 'chips', 'aria-label': t('library.language') },
      work.available_languages.map((l) => h('span', { class: 'chip' }, l.toUpperCase())),
    ),
  );
}

export function errorBox(message: string): HTMLElement {
  return h('div', { class: 'notice notice--error', role: 'alert' }, h('strong', {}, t('common.error')), h('p', {}, message));
}

/** Star toggle for a vocabulary word; keeps its own label in sync with the store. `compact` renders a star-only button. */
export function saveButton(word: SavedWord, onChange?: () => void, compact = false): HTMLButtonElement {
  const btn = h('button', { type: 'button', class: compact ? 'btn btn--small btn--star' : 'btn btn--small' });
  const paint = () => {
    const saved = isSaved(word.id);
    const label = saved ? t('work.saved') : t('work.save');
    btn.setAttribute('aria-pressed', String(saved));
    if (compact) {
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.textContent = saved ? '★' : '☆';
    } else {
      btn.textContent = saved ? `★ ${label}` : `☆ ${label}`;
    }
  };
  btn.addEventListener('click', () => {
    toggleWord(word);
    paint();
    onChange?.();
  });
  paint();
  return btn;
}
