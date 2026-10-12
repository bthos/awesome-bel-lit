export const REPO = 'bthos/awesome-bel-lit';
export const BRANCH = 'main';

export interface Language {
  code: string;
  native: string;
  english: string;
}

/** Languages the corpus is set up for (keep in sync with public/metadata/languages.json). */
export const LANGUAGES: Language[] = [
  { code: 'be', native: 'Беларуская', english: 'Belarusian' },
  { code: 'en', native: 'English', english: 'English' },
  { code: 'ru', native: 'Русский', english: 'Russian' },
  { code: 'pl', native: 'Polski', english: 'Polish' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'uk', native: 'Українська', english: 'Ukrainian' },
  { code: 'lt', native: 'Lietuvių', english: 'Lithuanian' },
  { code: 'lv', native: 'Latviešu', english: 'Latvian' },
];

export function langName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.native ?? code.toUpperCase();
}

const contentDir = (author: string, work: string) => `content/authors/${author}/works/${work}`;

/** GitHub "create file" URL pre-filled for a new translation. */
export function newTranslationUrl(author: string, work: string, lang: string): string {
  return `https://github.com/${REPO}/new/${BRANCH}/${contentDir(author, work)}?filename=${lang}.md`;
}

export function editTranslationUrl(author: string, work: string, lang: string): string {
  return `https://github.com/${REPO}/edit/${BRANCH}/${contentDir(author, work)}/${lang}.md`;
}

export const CONTRIBUTING_URL = `https://github.com/${REPO}/blob/${BRANCH}/CONTRIBUTING.md`;
export const REPO_URL = `https://github.com/${REPO}`;
