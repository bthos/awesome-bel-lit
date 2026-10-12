/**
 * Picks the first language from the browser's preference list (`navigator.languages`,
 * most preferred first) that the site supports. A regional tag falls back to its
 * primary subtag ("be-BY" -> "be", "pt-BR" -> "pt"). Returns `fallback` when nothing matches.
 */
export function negotiateLanguage(requested: readonly string[], supported: readonly string[], fallback: string): string {
  for (const raw of requested) {
    const tag = raw.trim().toLowerCase().replace(/_/g, '-');
    if (!tag || tag === '*') continue;
    const exact = supported.find((s) => s.toLowerCase() === tag);
    if (exact) return exact;
    const primary = tag.split('-')[0];
    const loose = supported.find((s) => s.toLowerCase() === primary);
    if (loose) return loose;
  }
  return fallback;
}
