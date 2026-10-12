// Belarusian Cyrillic -> Latin (Lacinka, traditional orthography).
// A reading aid for learners, not an official romanization of every edge case.

const SIMPLE: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', ж: 'ž', з: 'z', і: 'i',
  й: 'j', к: 'k', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ў: 'ŭ', ф: 'f', х: 'ch', ц: 'c', ч: 'č', ш: 'š', ы: 'y', э: 'e',
};

/** Consonants that palatalise a following iotated vowel (я ю е ё). */
const CONSONANTS = 'бвгґджзклмнпрстфхцчш';
/** Letters whose softness is written with a trailing ь. */
const SOFT: Record<string, string> = { з: 'ź', н: 'ń', с: 'ś', ц: 'ć' };
/** [after vowel / word start / apostrophe, after consonant] */
const IOTATED: Record<string, [string, string]> = {
  я: ['ja', 'ia'], ю: ['ju', 'iu'], е: ['je', 'ie'], ё: ['jo', 'io'],
};
const SOFTENS_L = 'яеёюіь';
const APOSTROPHES = "'’ʼ";

export function toLacinka(input: string): string {
  const src = [...input];
  let out = '';
  // Last source letter consumed (lower-case); drives iotated-vowel choice.
  let prev = '';

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const c = ch.toLowerCase();
    const upper = ch !== c;
    const next = (src[i + 1] ?? '').toLowerCase();
    let res: string | undefined;

    if (c === 'д' && next === 'з') {
      // дз / дзь
      const soft = (src[i + 2] ?? '').toLowerCase() === 'ь';
      res = soft ? 'dź' : 'dz';
      i += soft ? 2 : 1;
      prev = soft ? 'ь' : 'з';
    } else if (c === 'д' && next === 'ж') {
      res = 'dž';
      i += 1;
      prev = 'ж';
    } else if (c === 'л') {
      res = SOFTENS_L.includes(next) && next !== '' ? 'l' : 'ł';
      if (next === 'ь') {
        i += 1;
        prev = 'ь';
      } else {
        prev = c;
      }
    } else if (c in SOFT && next === 'ь') {
      res = SOFT[c];
      i += 1;
      prev = 'ь';
    } else if (c === 'ь') {
      res = '';
      prev = 'ь';
    } else if (APOSTROPHES.includes(c)) {
      res = '';
      prev = "'";
    } else if (c in IOTATED) {
      const afterConsonant = prev !== '' && (CONSONANTS.includes(prev) || prev === 'ь');
      res = IOTATED[c][afterConsonant ? 1 : 0];
      prev = c;
    } else if (c in SIMPLE) {
      res = SIMPLE[c];
      prev = c;
    }

    if (res === undefined) {
      out += ch; // non-Belarusian char (punctuation, digits, Latin)
      prev = '';
    } else {
      out += upper ? res.charAt(0).toUpperCase() + res.slice(1) : res;
    }
  }
  return out;
}
