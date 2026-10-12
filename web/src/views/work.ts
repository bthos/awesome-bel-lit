import { fill, h } from '../lib/dom.ts';
import { getContent, getIndex, getMeta, pick } from '../lib/data.ts';
import { editTranslationUrl, langName } from '../lib/config.ts';
import { t } from '../lib/i18n.ts';
import { SIZE_MAX, SIZE_MIN, prefs, saveMany, setPref } from '../lib/store.ts';
import type { ReadMode, SavedWord } from '../lib/store.ts';
import { toLacinka } from '../lib/translit.ts';
import type { Block, Note, VocabEntry, WorkContent } from '../lib/types.ts';
import { authorName, errorBox, saveButton, typeLabel } from './components.ts';
import { showPopover } from './popover.ts';

const NO_TRANSLATION = 'none';
const MODES: ReadMode[] = ['reveal', 'side', 'stack'];
const TOGGLES = ['translit', 'highlight', 'notes'] as const;

const blockLines = (b: Block): string[] => (b.type === 'stanza' ? b.lines : [b.text]);

export async function workView(authorId: string, workId: string): Promise<HTMLElement> {
  const [index, meta] = await Promise.all([getIndex(), getMeta(authorId, workId)]);
  const entry = index.authors.find((a) => a.id === authorId);
  const work = entry?.works.find((w) => w.id === workId);
  if (!entry || !work || !meta) return errorBox(t('work.notFound'));

  const origLang = meta.original_language;
  const original = await getContent(authorId, workId, origLang);
  if (!original) return errorBox(t('work.notFound'));

  const translationLangs = work.available_languages.filter((l) => l !== origLang);
  const vocab = new Map<string, VocabEntry>((original.vocabulary ?? []).map((v) => [v.word.toLowerCase(), v]));

  let transLang: string | null =
    prefs.trans === NO_TRANSLATION ? null : translationLangs.includes(prefs.trans) ? prefs.trans : (translationLangs[0] ?? null);
  let trans: WorkContent | null = null;

  document.title = `${original.title} · ${authorName(entry)} · ${t('brand')}`;

  // ---- word popover -------------------------------------------------------
  function contextLine(word: string): string {
    const needle = word.toLowerCase();
    for (const block of original!.content) {
      const hit = blockLines(block).find((l) => l.toLowerCase().includes(needle));
      if (hit) return hit;
    }
    return '';
  }

  function toSaved(v: VocabEntry): SavedWord {
    return {
      id: `${authorId}/${workId}/${v.word.toLowerCase()}`,
      word: v.word,
      lemma: v.lemma,
      pos: v.pos,
      gloss: pick(v.gloss, [transLang, prefs.ui, 'en']),
      line: contextLine(v.word),
      author: authorId,
      work: workId,
      workTitle: original!.title,
      known: false,
    };
  }

  function openWord(anchor: HTMLElement, word: string): void {
    const v = vocab.get(word.toLowerCase());
    const lookup = v?.lemma ?? word.toLowerCase();
    showPopover(
      anchor,
      word,
      h('p', { class: 'pop__word', lang: origLang }, word),
      h('p', { class: 'pop__lat' }, toLacinka(word)),
      v
        ? h(
            'div',
            {},
            h('p', { class: 'pop__gloss' }, pick(v.gloss, [transLang, prefs.ui, 'en'])),
            h('p', { class: 'pop__meta' }, [
              v.lemma && v.lemma !== v.word.toLowerCase() && `${t('work.from')} `,
              v.lemma && v.lemma !== v.word.toLowerCase() && h('span', { lang: origLang }, v.lemma),
              v.lemma && v.lemma !== v.word.toLowerCase() && v.pos && ' · ',
              v.pos,
            ]),
          )
        : h('p', { class: 'pop__meta' }, t('work.noGloss')),
      h(
        'div',
        { class: 'pop__actions' },
        v && saveButton(toSaved(v), paintVocab),
        h('a', { class: 'link', href: `https://en.wiktionary.org/wiki/${encodeURIComponent(lookup)}#Belarusian`, target: '_blank', rel: 'noopener' }, `${t('work.lookup')} ↗`),
      ),
    );
  }

  // ---- text ---------------------------------------------------------------
  // Each word is wrapped with its trailing punctuation in a nowrap group, so "?" or "," never starts a line.
  const WORD_GROUP_RE = /([\p{L}\u0301'’ʼ]+)([^\p{L}\u0301'’ʼ\s]*)/gu;
  function wordNodes(line: string): Array<Node | string> {
    const out: Array<Node | string> = [];
    let last = 0;
    for (const m of line.matchAll(WORD_GROUP_RE)) {
      if (m.index > last) out.push(line.slice(last, m.index));
      const [whole, word, trail] = m;
      const v = prefs.highlight ? vocab.get(word.toLowerCase()) : undefined;
      const attrs: Record<string, string | ((e: Event) => void)> = { type: 'button', class: v ? 'w w--gloss' : 'w', onclick: (e: Event) => openWord(e.currentTarget as HTMLElement, word) };
      if (v) attrs['data-gloss'] = pick(v.gloss, [transLang, prefs.ui, 'en']);
      out.push(h('span', { class: 'wg' }, h('button', attrs, word), trail));
      last = m.index + whole.length;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
  }

  function stanzaEl(block: Block, tBlock: Block | undefined, notes: Note[]): HTMLElement {
    const orig = h(
      'div',
      { class: 'stanza__orig', lang: origLang },
      blockLines(block).map((line) =>
        h('p', { class: 'line' }, wordNodes(line), prefs.translit && h('span', { class: 'line__lat', lang: 'be-Latn', title: t('work.translitHelp') }, toLacinka(line))),
      ),
    );
    const tr = tBlock && h('div', { class: 'stanza__trans', lang: transLang ?? undefined }, blockLines(tBlock).map((l) => h('p', { class: 'tline' }, l)));

    let reveal: HTMLButtonElement | null = null;
    if (tr && prefs.mode === 'reveal') {
      tr.hidden = true;
      const button = h('button', { type: 'button', class: 'reveal', 'aria-expanded': 'false' }, t('work.show'));
      button.addEventListener('click', () => {
        tr.hidden = !tr.hidden;
        button.setAttribute('aria-expanded', String(!tr.hidden));
        button.textContent = tr.hidden ? t('work.show') : t('work.hide');
      });
      reveal = button;
    }

    const ref = `${block.type}:${block.number}`;
    const own = prefs.notes ? notes.filter((n) => n.reference === ref) : [];

    return h(
      'section',
      { class: 'stanza' },
      h('span', { class: 'stanza__n', 'aria-hidden': 'true' }, block.number),
      h('div', { class: 'stanza__body' }, orig, reveal, tr),
      own.map((n) => h('aside', { class: 'note', lang: transLang ?? undefined }, h('strong', {}, `${t('work.note')} `), n.text)),
    );
  }

  const text = h('div', { class: 'text' });
  const subtitle = h('p', { class: 'work__sub' });
  const foot = h('footer', { class: 'work__foot' });
  const vocabEl = h('section', { class: 'vocab' });

  function paintVocab(): void {
    const entries = original!.vocabulary ?? [];
    if (entries.length === 0) {
      vocabEl.replaceChildren();
      return;
    }
    vocabEl.replaceChildren(
      h(
        'div',
        { class: 'vocab__head' },
        h('h2', { class: 'section__title' }, `${t('work.vocab')} (${entries.length})`),
        h('button', { type: 'button', class: 'btn btn--small', onclick: () => { saveMany(entries.map(toSaved)); paintVocab(); } }, t('work.vocab.saveAll')),
      ),
      h(
        'ul',
        { class: 'vocab__list' },
        entries.map((v) =>
          h(
            'li',
            { class: 'vocab__row' },
            h('span', { class: 'vocab__word', lang: origLang }, v.word),
            h('span', { class: 'vocab__lat' }, toLacinka(v.word)),
            h('span', { class: 'vocab__gloss' }, pick(v.gloss, [transLang, prefs.ui, 'en']), v.pos ? h('em', {}, ` · ${v.pos}`) : ''),
            saveButton(toSaved(v), paintVocab, true),
          ),
        ),
      ),
    );
  }

  async function paintText(): Promise<void> {
    trans = transLang ? await getContent(authorId, workId, transLang) : null;
    const byNumber = new Map<number, Block>((trans?.content ?? []).map((b) => [b.number, b]));
    const notes = [...original!.notes, ...(trans?.notes ?? [])];
    text.className = `text text--${trans ? prefs.mode : 'solo'}`;
    text.replaceChildren(...original!.content.map((b) => stanzaEl(b, byNumber.get(b.number), notes)));
    subtitle.textContent = trans?.title ?? '';
    subtitle.lang = transLang ?? '';

    const credit = trans?.translator ? `${t('work.translatedBy')} ${trans.translator}${trans.translation_year ? `, ${trans.translation_year}` : ''}` : '';
    fill(
      foot,
      credit && h('p', {}, credit),
      transLang && h('a', { class: 'link', href: editTranslationUrl(authorId, workId, transLang), target: '_blank', rel: 'noopener' }, `${t('work.improve')} ↗`),
      h('a', { class: 'link', href: '#/progress' }, t('work.addTrans')),
    );
    paintVocab();
  }

  // ---- toolbar ------------------------------------------------------------
  const modeButtons = MODES.map((mode) =>
    h('button', { type: 'button', class: 'seg__btn', 'data-mode': mode, onclick: () => { setPref('mode', mode); syncToolbar(); void paintText(); } }, t(`work.mode.${mode}`)),
  );

  const select = h(
    'select',
    {
      class: 'select',
      'aria-label': t('work.translation'),
      onchange: (e) => {
        const value = (e.target as HTMLSelectElement).value;
        setPref('trans', value);
        transLang = value === NO_TRANSLATION ? null : value;
        void paintText();
      },
    },
    translationLangs.map((l) => h('option', { value: l }, langName(l))),
    h('option', { value: NO_TRANSLATION }, t('work.none')),
  );

  const toggleButtons = TOGGLES.map((key) =>
    h('button', { type: 'button', class: 'chip chip--button', 'data-pref': key, onclick: () => { setPref(key, !prefs[key]); syncToolbar(); void paintText(); } }, t(`work.${key}`)),
  );

  const article = h('article', { class: 'work' });
  const applySize = () => article.style.setProperty('--read-size', `${prefs.size}px`);
  const resize = (delta: number) => () => {
    setPref('size', Math.min(SIZE_MAX, Math.max(SIZE_MIN, prefs.size + delta)));
    applySize();
  };

  const toolbar = h(
    'div',
    { class: 'reader-bar' },
    translationLangs.length > 0 && h('div', { class: 'seg', role: 'group', 'aria-label': t('work.mode') }, modeButtons),
    translationLangs.length > 0 && select,
    h('div', { class: 'chips' }, toggleButtons),
    h(
      'div',
      { class: 'size' },
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('work.size.down'), onclick: resize(-2) }, 'A−'),
      h('button', { type: 'button', class: 'icon-btn icon-btn--big', 'aria-label': t('work.size.up'), onclick: resize(2) }, 'A+'),
    ),
  );

  function syncToolbar(): void {
    for (const b of modeButtons) b.setAttribute('aria-pressed', String(b.dataset.mode === prefs.mode));
    for (const b of toggleButtons) b.setAttribute('aria-pressed', String(prefs[b.dataset.pref as (typeof TOGGLES)[number]]));
    select.value = transLang ?? NO_TRANSLATION;
  }

  // ---- header -------------------------------------------------------------
  const tags = work.tags?.[prefs.ui] ?? work.tags?.[origLang] ?? [];
  const head = h(
    'header',
    { class: 'work__head' },
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, t('nav.library')), ' › ', h('a', { href: `#/author/${authorId}` }, authorName(entry))),
    h('h1', { class: 'work__title', lang: origLang }, original.title),
    subtitle,
    h(
      'p',
      { class: 'muted' },
      [typeLabel(meta.type), meta.year_written ? ` · ${meta.year_written}` : ''],
    ),
    tags.length > 0 && h('div', { class: 'chips' }, tags.map((tag) => h('span', { class: 'chip' }, tag))),
  );

  article.append(head, toolbar, text, vocabEl, foot);
  applySize();
  syncToolbar();
  await paintText();

  // Reading progress: the stitched thread under the toolbar fills as the poem is read.
  const onScroll = () => {
    if (!article.isConnected) {
      window.removeEventListener('scroll', onScroll);
      return;
    }
    const box = text.getBoundingClientRect();
    const total = box.height - window.innerHeight * 0.5;
    const pct = total > 0 ? Math.min(1, Math.max(0, (window.innerHeight * 0.5 - box.top) / total)) : 0;
    toolbar.style.setProperty('--progress', `${(pct * 100).toFixed(1)}%`);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return article;
}
