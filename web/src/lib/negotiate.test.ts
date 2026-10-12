import { test } from 'node:test';
import assert from 'node:assert/strict';
import { negotiateLanguage } from './negotiate.ts';

const supported = ['be', 'en', 'ru', 'pl'];

test('regional tag falls back to its primary language', () => {
  assert.equal(negotiateLanguage(['be-BY'], supported, 'en'), 'be');
  assert.equal(negotiateLanguage(['ru_RU'], supported, 'en'), 'ru');
});

test('browser preference order wins, not the order of the supported list', () => {
  assert.equal(negotiateLanguage(['pl-PL', 'be', 'en'], supported, 'en'), 'pl');
});

test('unsupported languages are skipped in favour of the next preference', () => {
  assert.equal(negotiateLanguage(['ja', 'de-DE', 'ru'], supported, 'en'), 'ru');
});

test('falls back when nothing matches or the list is empty', () => {
  assert.equal(negotiateLanguage(['ja', 'zh-CN'], supported, 'en'), 'en');
  assert.equal(negotiateLanguage([], supported, 'en'), 'en');
  assert.equal(negotiateLanguage(['*', ''], supported, 'en'), 'en');
});

test('case-insensitive and keeps the canonical supported code', () => {
  assert.equal(negotiateLanguage(['BE'], supported, 'en'), 'be');
  assert.equal(negotiateLanguage(['be-Tarask'], supported, 'en'), 'be');
});
