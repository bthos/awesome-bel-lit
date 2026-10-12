import { h } from '../lib/dom.ts';
import { t } from '../lib/i18n.ts';
import { savedWords, setKnown, toggleWord } from '../lib/store.ts';
import type { SavedWord } from '../lib/store.ts';
import { toLacinka } from '../lib/translit.ts';

export function wordsView(): HTMLElement {
  document.title = `${t('words.title')} · ${t('brand')}`;
  const body = h('div', { class: 'words__body' });
  let mode: 'list' | 'practice' = 'list';
  let queue: string[] = [];

  const tabs = h('div', { class: 'seg', role: 'group' });

  function startPractice(): void {
    queue = savedWords().filter((w) => !w.known).map((w) => w.id);
    mode = 'practice';
    paint();
  }

  function metaLine(w: SavedWord): string {
    const lemma = w.lemma && w.lemma.toLowerCase() !== w.word.toLowerCase() ? `${t('work.from')} ${w.lemma}` : '';
    return [lemma, w.pos].filter(Boolean).join(' · ');
  }

  function paintList(words: SavedWord[]): HTMLElement {
    return h(
      'ul',
      { class: 'vocab__list' },
      words.map((w) =>
        h(
          'li',
          { class: 'vocab__row vocab__row--saved' },
          h('span', { class: 'vocab__word', lang: 'be' }, w.word),
          h('span', { class: 'vocab__lat' }, toLacinka(w.word)),
          h(
            'span',
            { class: 'vocab__gloss' },
            w.gloss,
            metaLine(w) && h('em', {}, ` · ${metaLine(w)}`),
            w.line && h('span', { class: 'vocab__ctx', lang: 'be' }, w.line),
            h('a', { class: 'link', href: `#/work/${w.author}/${w.work}` }, `↗ ${w.workTitle ?? w.work}`),
          ),
          h(
            'span',
            { class: 'vocab__actions' },
            h('button', { type: 'button', class: 'btn btn--small', 'aria-pressed': w.known, onclick: () => { setKnown(w.id, !w.known); paint(); } }, `✓ ${t('words.learned')}`),
            h('button', { type: 'button', class: 'btn btn--small', onclick: () => { toggleWord(w); paint(); } }, t('words.remove')),
          ),
        ),
      ),
    );
  }

  function paintCard(): HTMLElement {
    const word = savedWords().find((w) => w.id === queue[0]);
    if (!word) {
      return h(
        'div',
        { class: 'notice' },
        h('p', {}, t('words.done')),
        h('button', { type: 'button', class: 'btn', onclick: () => { for (const w of savedWords()) setKnown(w.id, false); startPractice(); } }, t('words.restart')),
      );
    }
    let flipped = false;
    const back = h('div', { class: 'card-back', hidden: true }, h('p', { class: 'pop__gloss' }, word.gloss), h('p', { class: 'pop__meta' }, metaLine(word)));
    const actions = h('div', { class: 'card-actions' });
    const flip = h('button', { type: 'button', class: 'btn btn--primary' }, t('words.flip'));
    flip.addEventListener('click', () => {
      flipped = !flipped;
      back.hidden = !flipped;
      flip.hidden = flipped;
      actions.hidden = !flipped;
    });
    actions.hidden = true;
    actions.append(
      h('button', { type: 'button', class: 'btn', onclick: () => { queue = [...queue.slice(1), queue[0]]; paint(); } }, t('words.again')),
      h('button', { type: 'button', class: 'btn btn--primary', onclick: () => { setKnown(word.id, true); queue = queue.slice(1); paint(); } }, t('words.known')),
    );

    return h(
      'div',
      { class: 'flash' },
      h('p', { class: 'muted' }, `${queue.length} ${t('words.remaining')}`),
      h('p', { class: 'pop__word flash__word', lang: 'be' }, word.word),
      h('p', { class: 'pop__lat' }, toLacinka(word.word)),
      word.line && h('p', { class: 'vocab__ctx', lang: 'be' }, word.line),
      back,
      flip,
      actions,
    );
  }

  function paint(): void {
    const words = savedWords();
    if (words.length === 0) {
      tabs.replaceChildren();
      body.replaceChildren(h('div', { class: 'notice' }, h('p', {}, t('words.empty')), h('a', { class: 'btn', href: '#/' }, t('nav.library'))));
      return;
    }
    tabs.replaceChildren(
      h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': mode === 'list', onclick: () => { mode = 'list'; paint(); } }, t('words.list')),
      h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': mode === 'practice', onclick: startPractice }, t('words.practice')),
    );
    body.replaceChildren(mode === 'list' ? paintList(words) : paintCard());
  }

  paint();
  return h('div', { class: 'words' }, h('h1', { class: 'page-title' }, t('words.title')), h('p', { class: 'lead' }, t('words.lead')), tabs, body);
}
