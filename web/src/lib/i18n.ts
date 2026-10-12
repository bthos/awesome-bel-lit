import { dictionaries, en } from './locales.ts';
import type { Key } from './locales.ts';
import { prefs } from './store.ts';

export type { Key };

export function t(key: Key): string {
  return dictionaries[prefs.ui]?.[key] ?? en[key];
}

export function isKey(key: string): key is Key {
  return key in en;
}
