# Repository Structure

This document describes the structure and organization of the Belarusian literature translation repository.

## Directory Structure

```
awesome-bel-lit/
├── authors/              # Author information and metadata
│   └── {author-id}/      # Author directory (unique ID)
│       ├── info.json     # Author metadata in multiple languages
│       └── works/        # Works by this author
│           └── {work-id}/    # Work directory (unique ID)
│               ├── metadata.json  # Work metadata
│               └── content/       # Original and translated content
│                   ├── be.md      # Belarusian (original) - Markdown
│                   ├── be.json    # Belarusian - JSON (auto-generated)
│                   ├── en.md      # English translation - Markdown
│                   ├── en.json    # English - JSON (auto-generated)
│                   └── ...        # Other language translations
├── metadata/            # Repository-wide metadata
│   ├── languages.json   # Supported languages list
│   └── index.json       # Complete index of all content
├── translations/        # Translation progress tracking
│   └── status.json      # Translation status by work/language
└── build.py            # Build script (converts .md to .json)
```

## Naming Convention

### Author IDs
- Format: `lastname-firstname` in Latin characters
- Examples: `kupala-yanka`, `kolos-yakub`, `bahdanovich-maksim`
- Use transliteration from Belarusian to Latin (ISO 9:1995 or similar)
- Lowercase, hyphen-separated
- For authors with multiple names, use most commonly known form

### Work IDs
- Format: `short-meaningful-title` in English
- Examples: `who-goes-there`, `new-land`, `wreath`
- Lowercase, hyphen-separated
- Keep it short (2-5 words maximum)
- Must be unique within an author's works

### Language Codes
- Use ISO 639-1 two-letter codes
- Examples: `be` (Belarusian), `en` (English), `ru` (Russian), `pl` (Polish)
- For regional variants, use ISO 639-1 with region: `en-US`, `en-GB`

## File Formats

### Content Format Options

This repository supports **two formats** for literary content:

1. **Markdown (.md)** - Recommended for content authors (easy to write and edit)
2. **JSON (.json)** - Generated automatically for API consumption

**For content authors**: Write your content in Markdown format with YAML frontmatter. The JSON files are automatically generated using the `build.py` script.

**For developers**: Use the JSON files for API consumption. They are kept in sync with Markdown sources.

### Author Info (`authors/{author-id}/info.json`)

```json
{
  "id": "kupala-yanka",
  "names": {
    "be": "Янка Купала",
    "en": "Yanka Kupala",
    "ru": "Янка Купала"
  },
  "biography": {
    "be": "Беларускі паэт...",
    "en": "Belarusian poet...",
    "ru": "Белорусский поэт..."
  },
  "birth_year": 1882,
  "death_year": 1942,
  "image_url": "https://example.com/kupala.jpg",
  "external_links": {
    "wikipedia": {
      "be": "https://be.wikipedia.org/wiki/...",
      "en": "https://en.wikipedia.org/wiki/...",
      "ru": "https://ru.wikipedia.org/wiki/..."
    }
  }
}
```

### Work Metadata (`authors/{author-id}/works/{work-id}/metadata.json`)

```json
{
  "id": "who-goes-there",
  "author_id": "kupala-yanka",
  "type": "poem",
  "titles": {
    "be": "Хто там ідзе?",
    "en": "Who Goes There?",
    "ru": "Кто там идёт?"
  },
  "year_written": 1913,
  "year_published": 1913,
  "original_language": "be",
  "available_translations": ["en", "ru", "pl"],
  "tags": {
    "be": ["паэзія", "патрыятызм"],
    "en": ["poetry", "patriotism"],
    "ru": ["поэзия", "патриотизм"]
  }
}
```

### Content Files (`authors/{author-id}/works/{work-id}/content/{lang}.md`)

**Markdown Format (Recommended for Authors)**

For poetry:

```markdown
---
language: be
work_id: who-goes-there
author_id: kupala-yanka
title: Хто там ідзе?
content_type: poem
translator: null
translation_year: null
---

Хто там ідзе? Хто там ідзе
У гэтай цемры ноччы?

— Свой, брат, свой! Беларус наш,
Што ноччу ў полі сеча.

— Ідзі ж сюды, садзіся тут.
— Не магу. Няма часу.

— А што ж ты нясеш? Куды ж ідзеш?
— На стрэчу дню. Свабоду.
```

For prose:

```markdown
---
language: en
work_id: story-example
author_id: author-id
title: Story Title
content_type: prose
translator: Translator Name
translation_year: 2024
notes:
  - reference: paragraph:2
    text: Cultural context note...
---

The first paragraph of the story...

The second paragraph continues the narrative...

The third paragraph concludes the section.
```

**Key points:**
- Start with YAML frontmatter between `---` markers
- Separate stanzas/paragraphs with blank lines
- Lines within a stanza stay on separate lines
- Translator notes go in the frontmatter

**Build Process:**

Run `python3 build.py` to convert Markdown files to JSON:

```bash
python3 build.py
```

This generates the JSON files automatically from your Markdown sources.

### Content Files (`authors/{author-id}/works/{work-id}/content/{lang}.json`)

**JSON Format (Auto-generated for API Consumption)**

The JSON format is generated automatically from Markdown sources. You can also create JSON files directly if needed.

```json
{
  "language": "be",
  "work_id": "who-goes-there",
  "author_id": "kupala-yanka",
  "title": "Хто там ідзе?",
  "content_type": "poem",
  "structure": "stanzas",
  "content": [
    {
      "type": "stanza",
      "number": 1,
      "lines": [
        "Хто там ідзе? Хто там ідзе",
        "У гэтай цёмнай ноччы?"
      ]
    },
    {
      "type": "stanza",
      "number": 2,
      "lines": [
        "Што ты нясеш? Што ты нясеш",
        "Над сваёй галавою?"
      ]
    }
  ],
  "translator": null,
  "translation_year": null,
  "notes": []
}
```

For prose works:

```json
{
  "language": "en",
  "work_id": "story-example",
  "author_id": "author-id",
  "title": "Story Title",
  "content_type": "prose",
  "structure": "paragraphs",
  "content": [
    {
      "type": "paragraph",
      "number": 1,
      "text": "The first paragraph of the story..."
    },
    {
      "type": "paragraph",
      "number": 2,
      "text": "The second paragraph..."
    }
  ],
  "translator": "Translator Name",
  "translation_year": 2024,
  "notes": [
    {
      "reference": "paragraph:2",
      "text": "Cultural context note..."
    }
  ]
}
```

## Translation Guidelines

### For Translators

1. **Fork the repository** and create a new branch for your translation
2. **Copy the original content file** (`be.json`) to your target language (`en.json`, `ru.json`, etc.)
3. **Translate the content**:
   - Keep the JSON structure intact
   - Translate `title` field
   - Translate each line/paragraph in the `content` array
   - Add your name in `translator` field
   - Add translation year in `translation_year` field
   - Add any necessary cultural notes in `notes` array
4. **Update metadata**:
   - Add your language code to `available_translations` in `metadata.json`
5. **Submit a Pull Request** with your translation

### Quality Standards

- Maintain the original meaning and poetic structure where possible
- Preserve line breaks for poetry
- Add cultural context notes when necessary
- Use proper punctuation and formatting for the target language
- Provide attribution for the translation

## Front-End Integration

### API Structure

The repository can be consumed by front-end applications through:

1. **Direct GitHub API** (for dynamic content)
   - `https://api.github.com/repos/bthos/awesome-bel-lit/contents/authors/{author-id}/info.json`
   - `https://api.github.com/repos/bthos/awesome-bel-lit/contents/authors/{author-id}/works/{work-id}/content/{lang}.json`

2. **GitHub Pages/Vercel** (for static builds)
   - Clone repository during build
   - Generate static pages from JSON files
   - Deploy to GitHub Pages or Vercel

3. **Index File** (for efficient browsing)
   - `metadata/index.json` contains complete repository index
   - Use for navigation and search functionality

### Example Front-End Usage

```javascript
// Fetch author information
async function getAuthorInfo(authorId, language = 'en') {
  const response = await fetch(
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/${authorId}/info.json`
  );
  const data = await response.json();
  return {
    name: data.names[language] || data.names.en,
    bio: data.biography[language] || data.biography.en,
    ...data
  };
}

// Fetch work content
async function getWorkContent(authorId, workId, language = 'be') {
  const response = await fetch(
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/${authorId}/works/${workId}/content/${language}.json`
  );
  return await response.json();
}
```

## Versioning

- Use Git tags for major content releases
- Format: `v1.0.0`, `v1.1.0`, etc.
- Tag when significant new content is added or structure changes

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.
