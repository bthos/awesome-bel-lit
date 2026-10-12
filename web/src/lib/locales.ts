import { LANGUAGES } from './config.ts';
import en from '../locales/en.ts';

export type Key = keyof typeof en;
export type Dictionary = Partial<Record<Key, string>>;

export { en };

// Every `src/locales/<code>.ts` is a UI language. Adding a file is all it takes.
const modules = import.meta.glob<{ default: Dictionary }>('../locales/*.ts', { eager: true });

export const dictionaries: Record<string, Dictionary> = {};
for (const [path, mod] of Object.entries(modules)) {
  const code = path.match(/([^/]+)\.ts$/)?.[1];
  if (code) dictionaries[code] = mod.default;
}

/** UI languages in corpus order (Belarusian first). A locale file for a code missing from LANGUAGES is ignored. */
export const UI_LANGUAGES: string[] = LANGUAGES.map((l) => l.code).filter((code) => code in dictionaries);
