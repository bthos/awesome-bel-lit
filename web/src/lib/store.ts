import { UI_LANGUAGES } from './locales.ts';
import { negotiateLanguage } from './negotiate.ts';

export type ReadMode = 'reveal' | 'side' | 'stack';
export type Theme = 'auto' | 'light' | 'dark';

export interface Prefs {
  ui: string;
  mode: ReadMode;
  trans: string;
  translit: boolean;
  highlight: boolean;
  notes: boolean;
  size: number; // reading font size in px
  theme: Theme;
}

export interface SavedWord {
  id: string; // author/work/lowercased form
  word: string;
  lemma?: string;
  pos?: string;
  gloss: string;
  line: string; // line of the text the word was met in
  author: string;
  work: string;
  workTitle?: string;
  known: boolean;
}

const PREFS_KEY = 'bel-lit:prefs';
const WORDS_KEY = 'bel-lit:words';
const UI_KEY = 'bel-lit:ui'; // written only when the user picks a language; otherwise the browser decides

export const SIZE_MIN = 16;
export const SIZE_MAX = 30;

/** Explicit choice if there is one, else the browser's preferred language, else English. */
function initialUi(): string {
  const chosen = read<string | null>(UI_KEY, null);
  if (chosen && UI_LANGUAGES.includes(chosen)) return chosen;
  const requested = typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language];
  return negotiateLanguage(requested, UI_LANGUAGES, 'en');
}

const ui = initialUi();

const defaults: Prefs = {
  ui,
  mode: 'side',
  trans: ui === 'be' ? 'en' : ui, // the original is Belarusian, so a translation in the reader's own language
  translit: false,
  highlight: true,
  notes: true,
  size: 20,
  theme: 'auto',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback; // private mode / corrupt value
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: preferences simply don't persist
  }
}

// `ui` lives under its own key; ignore a stale value an older version stored with the other prefs.
const { ui: _legacyUi, ...storedPrefs } = read<Partial<Prefs>>(PREFS_KEY, {});
export const prefs: Prefs = { ...defaults, ...storedPrefs };

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
  prefs[key] = value;
  if (key === 'ui') {
    write(UI_KEY, value);
  } else {
    const { ui: _ui, ...rest } = prefs;
    write(PREFS_KEY, rest);
  }
  if (key === 'theme') applyTheme();
}

export function applyTheme(): void {
  const root = document.documentElement;
  if (prefs.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', prefs.theme);
}

let words: SavedWord[] = read<SavedWord[]>(WORDS_KEY, []);

export function savedWords(): SavedWord[] {
  return words;
}

export function isSaved(id: string): boolean {
  return words.some((w) => w.id === id);
}

/** Adds the word, or removes it if already saved. Returns the new saved state. */
export function toggleWord(word: SavedWord): boolean {
  const saved = isSaved(word.id);
  words = saved ? words.filter((w) => w.id !== word.id) : [...words, word];
  write(WORDS_KEY, words);
  return !saved;
}

export function saveMany(list: SavedWord[]): void {
  const fresh = list.filter((w) => !isSaved(w.id));
  if (fresh.length === 0) return;
  words = [...words, ...fresh];
  write(WORDS_KEY, words);
}

export function setKnown(id: string, known: boolean): void {
  words = words.map((w) => (w.id === id ? { ...w, known } : w));
  write(WORDS_KEY, words);
}
