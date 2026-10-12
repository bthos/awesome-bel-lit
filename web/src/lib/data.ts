import type { AuthorInfo, CorpusIndex, LocalizedText, WorkContent, WorkMeta } from './types.ts';

const base = `${import.meta.env.BASE_URL}data/`;
const cache = new Map<string, Promise<unknown>>();

/** Fetch JSON once per session. Missing files (or SPA-fallback HTML) resolve to null. */
function load<T>(path: string): Promise<T | null> {
  let pending = cache.get(path);
  if (!pending) {
    pending = fetch(base + path).then(async (res) => {
      if (!res.ok) return null;
      try {
        return await res.json();
      } catch {
        return null;
      }
    });
    cache.set(path, pending);
  }
  return pending as Promise<T | null>;
}

export async function getIndex(): Promise<CorpusIndex> {
  const index = await load<CorpusIndex>('metadata/index.json');
  if (!index) throw new Error('metadata/index.json not found. Run `python build.py`, then `npm run sync-data`.');
  return index;
}

export function getAuthor(id: string): Promise<AuthorInfo | null> {
  return load<AuthorInfo>(`authors/${id}/info.json`);
}

export function getMeta(author: string, work: string): Promise<WorkMeta | null> {
  return load<WorkMeta>(`authors/${author}/works/${work}/metadata.json`);
}

export function getContent(author: string, work: string, lang: string): Promise<WorkContent | null> {
  return load<WorkContent>(`authors/${author}/works/${work}/content/${lang}.json`);
}

/** First non-empty value for the preferred languages, in order. */
export function pick(map: LocalizedText | undefined, langs: Array<string | null | undefined>): string {
  if (!map) return '';
  for (const lang of langs) {
    if (lang && map[lang]) return map[lang];
  }
  return Object.values(map)[0] ?? '';
}
