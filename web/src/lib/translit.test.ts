import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLacinka } from './translit.ts';

const cases: Array<[string, string]> = [
  ['ідзе', 'idzie'],          // дз + е after consonant
  ['яны', 'jany'],            // initial я -> ja
  ['нясуць', 'niasuć'],       // я after consonant -> ia, soft ць -> ć
  ['лапцях', 'łapciach'],     // hard л -> ł, х -> ch
  ['крыўду', 'kryŭdu'],       // ў -> ŭ, ы -> y
  ['Беларусы', 'Biełarusy'],  // capital preserved, е -> ie
  ['мільён', 'milion'],       // ль -> l, ё after ь -> io
  ['Людзьмі', 'Liudźmi'],     // дзь -> dź
  ['звацца', 'zvacca'],
  ['сляпым', 'sliapym'],
  ["сям'я", 'siamja'],        // apostrophe -> iotated vowel keeps j
  ['Хто', 'Chto'],
  ['— Бяда, гора.', '— Biada, hora.'], // punctuation untouched
];

for (const [cyr, lat] of cases) {
  test(`${cyr} -> ${lat}`, () => {
    assert.equal(toLacinka(cyr), lat);
  });
}
