import { h } from '../lib/dom.ts';
import { t } from '../lib/i18n.ts';
import { toLacinka } from '../lib/translit.ts';

interface Letter {
  /** Lower-case letter; the upper-case form is derived. */
  l: string;
  sound: string;
  word: string;
  meaning: string;
}

const ALPHABET: Letter[] = [
  { l: 'а', sound: '“a” in father', word: 'акно', meaning: 'window' },
  { l: 'б', sound: '“b” in bat', word: 'брат', meaning: 'brother' },
  { l: 'в', sound: '“v” in van', word: 'вада', meaning: 'water' },
  { l: 'г', sound: 'a breathy, voiced “h”; never a hard “g”', word: 'гора', meaning: 'grief, sorrow' },
  { l: 'д', sound: '“d” in dog', word: 'дом', meaning: 'house' },
  { l: 'е', sound: '“ye” in yes; softens a consonant before it', word: 'ехаць', meaning: 'to travel (by vehicle)' },
  { l: 'ё', sound: '“yo” in yonder; always stressed', word: 'ёсць', meaning: 'there is' },
  { l: 'ж', sound: '“s” in measure; always hard', word: 'жыццё', meaning: 'life' },
  { l: 'з', sound: '“z” in zoo', word: 'зорка', meaning: 'star' },
  { l: 'і', sound: '“ee” in see', word: 'ігла', meaning: 'needle' },
  { l: 'й', sound: '“y” in boy', word: 'мой', meaning: 'my (masc.)' },
  { l: 'к', sound: '“k” in kit', word: 'кніга', meaning: 'book' },
  { l: 'л', sound: '“l”; thick (dark) before а о у ы э, light before я е ё ю і ь', word: 'лес', meaning: 'forest' },
  { l: 'м', sound: '“m” in map', word: 'маці', meaning: 'mother' },
  { l: 'н', sound: '“n” in net', word: 'ноч', meaning: 'night' },
  { l: 'о', sound: '“o” in more, only when stressed; unstressed о sounds like а', word: 'вока', meaning: 'eye' },
  { l: 'п', sound: '“p” in pen', word: 'птушка', meaning: 'bird' },
  { l: 'р', sound: 'rolled “r”, as in Spanish or Italian', word: 'рака', meaning: 'river' },
  { l: 'с', sound: '“s” in sun', word: 'сонца', meaning: 'sun' },
  { l: 'т', sound: '“t” in top', word: 'тры', meaning: 'three' },
  { l: 'у', sound: '“oo” in moon', word: 'учора', meaning: 'yesterday' },
  { l: 'ў', sound: 'a short “u”, like the “w” in now or cow', word: 'крыўда', meaning: 'grievance, wrong' },
  { l: 'ф', sound: '“f” in fan', word: 'фарба', meaning: 'paint' },
  { l: 'х', sound: '“ch” in Scottish loch', word: 'хата', meaning: 'house, hut' },
  { l: 'ц', sound: '“ts” in cats', word: 'цёплы', meaning: 'warm' },
  { l: 'ч', sound: '“ch” in church, but harder and thicker; always hard', word: 'чалавек', meaning: 'person' },
  { l: 'ш', sound: '“sh” in shut, but harder; always hard', word: 'шлях', meaning: 'road, path' },
  { l: 'ы', sound: 'no English match: like the “i” in bit, said further back in the mouth', word: 'сыр', meaning: 'cheese' },
  { l: 'ь', sound: 'silent soft sign: it softens the consonant before it', word: 'дзень', meaning: 'day' },
  { l: 'э', sound: '“e” in bed', word: 'эхо', meaning: 'echo' },
  { l: 'ю', sound: '“yu” in you', word: 'юнак', meaning: 'young man' },
  { l: 'я', sound: '“ya” in yard', word: 'яблык', meaning: 'apple' },
];

interface Rule {
  title: string;
  body: string;
  examples: Array<[string, string]>;
}

const RULES: Rule[] = [
  {
    title: 'Write what you hear',
    body: 'Spelling mostly follows pronunciation. Unstressed о is pronounced а, and Belarusian writes it as а.',
    examples: [['горад', 'city'], ['гарады', 'cities']],
  },
  {
    title: 'Ў is a short “u”',
    body: 'It is a quick, w-like sound that closes a syllable. Do not read it as у.',
    examples: [['крыўду', 'grievance (acc.)'], ['наўчыў', 'taught']],
  },
  {
    title: 'Г is a voiced “h”',
    body: 'It is breathy, like the h in “ahead”, not the hard g in “go”.',
    examples: [['гора', 'grief'], ['гара', 'hill']],
  },
  {
    title: 'Hard and soft vowel pairs',
    body: 'Vowels come in pairs: а/я, у/ю, э/е, о/ё, ы/і. The second of each pair softens the consonant before it, and adds a “y” sound at the start of a word.',
    examples: [['нос', 'nose'], ['нёс', 'carried (he)']],
  },
  {
    title: 'Д and Т turn into ДЗ and Ц',
    body: 'Before soft vowels, д and т are pronounced — and written — дз and ц.',
    examples: [['ідзе', 'goes'], ['дзень', 'day'], ['цётка', 'aunt']],
  },
  {
    title: 'The apostrophe',
    body: 'An apostrophe keeps a consonant hard before я, ю, е, ё, і, and the vowel then sounds with its “y”.',
    examples: [["сям'я", 'family'], ["аб'ява", 'announcement']],
  },
];

const SAMPLE_LINE = 'А хто там ідзе, а хто там ідзе';

function alphabet(): HTMLElement {
  const detail = h('div', { class: 'letter-detail', 'aria-live': 'polite' });
  const buttons: HTMLButtonElement[] = [];

  function select(index: number): void {
    const { l, sound, word, meaning } = ALPHABET[index];
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    detail.replaceChildren(
      h('div', { class: 'letter-detail__glyph', lang: 'be' }, `${l.toUpperCase()}${l}`),
      h('p', { class: 'letter-detail__lat' }, toLacinka(l) || '—'),
      h('p', {}, h('strong', {}, `${t('learn.sound')}: `), sound),
      h(
        'p',
        { class: 'letter-detail__example' },
        h('strong', {}, `${t('learn.example')}: `),
        h('span', { lang: 'be', class: 'ex__word' }, word),
        ` (${toLacinka(word)}) — ${meaning}`,
      ),
    );
  }

  const grid = h(
    'div',
    { class: 'letters', role: 'group', 'aria-label': t('learn.alphabet') },
    ALPHABET.map(({ l }, i) => {
      const b = h('button', { type: 'button', class: 'letter', lang: 'be', onclick: () => select(i) }, `${l.toUpperCase()}${l}`);
      buttons.push(b);
      return b;
    }),
  );

  select(0);
  return h('section', { class: 'section' }, h('h2', { class: 'section__title' }, t('learn.alphabet')), h('div', { class: 'alphabet' }, grid, detail));
}

function converter(): HTMLElement {
  const input = h('textarea', { class: 'textarea', lang: 'be', rows: 3, placeholder: t('learn.tool.placeholder'), 'aria-label': t('learn.tool') });
  const output = h('p', { class: 'convert__out', lang: 'be-Latn', 'aria-live': 'polite' });
  const update = () => {
    output.textContent = toLacinka(input.value);
  };
  input.addEventListener('input', update);
  input.value = SAMPLE_LINE;
  update();

  return h(
    'section',
    { class: 'section' },
    h('h2', { class: 'section__title' }, t('learn.tool')),
    h('p', { class: 'muted' }, t('learn.tool.help')),
    h('div', { class: 'convert' }, input, output),
  );
}

export function learnView(): HTMLElement {
  document.title = `${t('learn.title')} · ${t('brand')}`;
  return h(
    'div',
    { class: 'learn' },
    h('h1', { class: 'page-title' }, t('learn.title')),
    h('p', { class: 'lead' }, t('learn.lead')),
    alphabet(),
    h(
      'section',
      { class: 'section' },
      h('h2', { class: 'section__title' }, t('learn.rules')),
      h(
        'div',
        { class: 'grid' },
        RULES.map((r) =>
          h(
            'div',
            { class: 'card rule' },
            h('h3', {}, r.title),
            h('p', {}, r.body),
            h('ul', { class: 'examples' }, r.examples.map(([w, m]) => h('li', {}, h('span', { lang: 'be', class: 'ex__word' }, w), ` · ${toLacinka(w)} · ${m}`))),
          ),
        ),
      ),
    ),
    converter(),
  );
}
