# Repository Structure

This document describes the structure and organization of the Belarusian literature translation repository.

## Overview

The repository uses a **source/generated** separation:

- **`content/`** - SOURCE files that content authors create and edit
- **`public/`** - GENERATED files built for front-end consumption (auto-generated, not committed)

## Directory Structure

```
awesome-bel-lit/
├── content/              # SOURCE - Content authors work here
│   └── authors/          # Author information and works
│       └── {author-id}/  # Author directory (unique ID)
│           ├── info.json # Author metadata in multiple languages
│           └── works/    # Works by this author
│               └── {work-id}/    # Work directory (unique ID)
│                   ├── metadata.json  # Work metadata (type, years)
│                   ├── be.md          # Belarusian - with title & tags
│                   ├── en.md          # English - with title & tags
│                   └── ...            # Other language translations
│
├── public/              # GENERATED + CONFIG - Built for front-end
│   └── metadata/
│       ├── languages.json   # Supported languages (configuration)
│   ├── authors/         # Processed author data
│   │   └── {author-id}/
│   │       ├── info.json    # Copied from source
│   │       └── works/
│   │           └── {work-id}/
│   │               ├── metadata.json  # With auto-added IDs
│   │               └── content/       # Generated JSON files
│   │                   ├── be.json    # Auto-generated from be.md
│   │                   ├── en.json    # Auto-generated from en.md
│   │                   └── ...
│   └── metadata/
│       └── index.json   # AUTO-GENERATED (titles & tags from .md)
│
└── build.py            # Build script (converts content/ -> public/)
```

## Key Principles

1. **Source of Truth**: `content/` directory contains the source files
2. **Markdown for Authors**: Content authors write in `.md` files (easy to edit)
3. **JSON for API**: Build process generates `.json` files for front-end consumption
4. **Auto-Generated Index**: `public/metadata/index.json` is parsed from source files
5. **Separation**: Clear distinction between what authors edit and what front-end uses

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

### Author Info (`content/authors/{author-id}/info.json`)

Location: `content/authors/{author-id}/info.json`

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

### Work Metadata (`content/authors/{author-id}/works/{work-id}/metadata.json`)

Location: `content/authors/{author-id}/works/{work-id}/metadata.json`

**Note**: Only work-level metadata. Titles and tags are in .md files (language-specific). IDs auto-generated from folder structure.

```json
{
  "type": "poem",
  "year_written": 1913,
  "year_published": 1913,
  "original_language": "be"
}
```

**Auto-generated during build:**
- `id` - From work folder name
- `author_id` - From author folder name
- `titles` - Collected from all .md files
- `tags` - Collected from all .md files

### Content Files (`content/authors/{author-id}/works/{work-id}/{lang}.md`)

**Markdown Format (Recommended for Authors)**

Minimalist frontmatter - most metadata derived from folder structure:

For poetry:

```markdown
---
title: Хто там ідзе?
tags:
  - паэзія
  - патрыятызм
---

Хто там ідзе? Хто там ідзе
У гэтай цемры ноччы?

— Свой, брат, свой! Беларус наш,
Што ноччу ў полі сеча.
```

For translations with attribution:

```markdown
---
title: Who Goes There?
tags:
  - poetry
  - patriotism
translator: Translator Name
translation_year: 2024
notes:
  - reference: stanza:2
    text: Cultural context note...
---

Who goes there? Who goes there
In this darkness of night?
```

For prose:

```markdown
---
title: Story Title
translator: Translator Name
translation_year: 2024
---

The first paragraph of the story...

The second paragraph continues the narrative...
```

**Frontmatter fields:**
- `title` (required) - Title in this language
- `tags` (optional) - Array of tags in this language
- `translator` (optional) - Translator name for translations (omit for originals)
- `translation_year` (optional) - Year of translation
- `notes` (optional) - Array of cultural/translation notes

**Auto-derived fields** (from folder structure):
- `language` - From filename (e.g., `be.md` → `be`)
- `work_id` - From work folder name
- `author_id` - From author folder name
- `content_type` - From `metadata.json` in work folder

**Key points:**
- Start with YAML frontmatter between `---` markers
- Separate stanzas/paragraphs with blank lines
- Lines within a stanza stay on separate lines

**Build Process:**

Run `python3 build.py` to convert Markdown files to JSON and add derived fields.

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
2. **Copy the original content file** (`.md`) to your target language
   - Example: `cp content/authors/{author-id}/works/{work-id}/be.md content/authors/{author-id}/works/{work-id}/en.md`
3. **Translate the content**:
   - Update `language` field in frontmatter
   - Translate `title` field
   - Translate all content (preserve structure)
   - Add your name in `translator` field
   - Add translation year in `translation_year` field
   - Add any necessary cultural notes in frontmatter
4. **Build and validate**:
   - Run `python3 build.py` to generate JSON files
   - Run `python3 validate.py` to check structure
5. **Submit a Pull Request** with your translation

### Quality Standards

- Maintain the original meaning and poetic structure where possible
- Preserve line breaks for poetry
- Add cultural context notes when necessary
- Use proper punctuation and formatting for the target language
- Provide attribution for the translation

## Build Process

The `build.py` script transforms source content into public-facing files:

1. **Reads source files** from `content/` directory
2. **Converts Markdown to JSON** for each work
3. **Copies metadata** (author info, work metadata)
4. **Auto-generates index.json** by parsing all source files
5. **Outputs everything** to `public/` directory

Run build:
```bash
python3 build.py
```

The `public/` directory is ignored by git (generated files, not source).

## Front-End Integration

### API Structure

The repository can be consumed by front-end applications through the `public/` directory:

1. **Direct GitHub API** (for dynamic content)
   - `https://api.github.com/repos/bthos/awesome-bel-lit/contents/public/authors/{author-id}/info.json`
   - `https://api.github.com/repos/bthos/awesome-bel-lit/contents/public/authors/{author-id}/works/{work-id}/content/{lang}.json`

2. **GitHub Pages/Vercel** (for static builds)
   - Run `python3 build.py` during deployment
   - Serve files from `public/` directory
   - Deploy to GitHub Pages or Vercel

3. **Index File** (for efficient browsing)
   - `public/metadata/index.json` contains complete repository index (auto-generated)
   - Use for navigation and search functionality

### Example Front-End Usage

```javascript
// Fetch author information
async function getAuthorInfo(authorId, language = 'en') {
  const response = await fetch(
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/authors/${authorId}/info.json`
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
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/authors/${authorId}/works/${workId}/content/${language}.json`
  );
  return await response.json();
}

// Fetch complete index
async function getIndex() {
  const response = await fetch(
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/metadata/index.json`
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
