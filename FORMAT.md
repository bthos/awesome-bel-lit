# Content Format Guide

This guide explains the dual-format approach used in this repository for storing literary content.

## Overview

The repository supports **two formats** for content:

1. **Markdown (.md)** - For content authors (easy to write and edit)
2. **JSON (.json)** - For API consumption (auto-generated from Markdown)

## Why Two Formats?

**Problem**: JSON is hard for content authors to edit and maintain. It requires escaping quotes, managing nested structures, and is error-prone for writing literary text.

**Solution**: Write content in Markdown (much easier), then automatically convert to JSON for API consumption.

### Benefits

- ✅ **For Authors**: Write in simple, readable Markdown format
- ✅ **For Developers**: Use structured JSON via API
- ✅ **Best of Both Worlds**: Easy authoring + structured data
- ✅ **Single Source of Truth**: Markdown files are the source
- ✅ **Automation**: `build.py` keeps JSON in sync

## Markdown Format

### Poetry Example

Minimalist frontmatter - most data derived from folder structure:

```markdown
---
title: Хто там ідзе?
---

Хто там ідзе? Хто там ідзе
У гэтай цемры ноччы?

— Свой, брат, свой! Беларус наш,
Што ноччу ў полі сеча.
```

### Prose Example

```markdown
---
title: My Story
translator: Translator Name
translation_year: 2024
notes:
  - reference: paragraph:2
    text: Historical context about this paragraph.
---

This is the first paragraph of the story. It sets the scene and introduces the main character.

This is the second paragraph. The narrative continues here with dialogue and action.

The story concludes in this final paragraph with resolution and reflection.
```

## Structure Rules

### YAML Frontmatter (Required)

All Markdown files **must** start with YAML frontmatter between `---` markers.

**Minimalist approach** - most metadata derived from folder structure:

```yaml
---
title: Work Title              # Title in this language (REQUIRED)
translator: Name               # Translator name (OPTIONAL, omit for originals)
translation_year: 2024         # Year translated (OPTIONAL)
orthography: official-1957     # Spelling standard of the text (OPTIONAL)
source: https://example.org/x  # Where the text was taken from (OPTIONAL)
notes:                         # Translation/cultural notes (OPTIONAL)
  - reference: stanza:2
    text: Note text here
---
```

**Auto-derived fields** (from folder structure):
- `language` - From filename (e.g., `be.md` → `be`)
- `work_id` - From work folder name (e.g., `who-goes-there`)
- `author_id` - From author folder name (e.g., `kupala-yanka`)
- `content_type` - From `metadata.json` file in work folder

**Required field:**
- `title` - The title in this language

**Optional fields:**
- `translator` - Name of translator (omit for original works)
- `translation_year` - Year of translation
- `orthography` - Spelling standard: `classical-YYYY` (тарашкевіца) or `official-YYYY` (official orthography); YYYY is the edition of the rules. Exposed as `orthography` in the generated JSON (`null` when unset)
- `source` - URL the text was taken from (kept in the Markdown only)
- `notes` - Array of translation or cultural notes
- `vocabulary` - Word glosses for the original text (powers tap-a-word help on the website)

### Content Body

**For Poetry:**
- Each stanza is separated by a **blank line**
- Lines within a stanza stay on **separate lines**
- No special formatting needed - just write naturally

**For Prose:**
- Each paragraph is separated by a **blank line**
- Write paragraphs as continuous text
- No manual line breaks within paragraphs

### Notes Format

Add translator or cultural notes in the frontmatter:

```yaml
notes:
  - reference: stanza:2
    text: The word 'сеча' (sows) is metaphorical for nation-building.
  - reference: paragraph:5
    text: This references a historical event from 1863.
```

### Vocabulary (optional)

Add glosses to the **original** text (e.g. `be.md`) so the website can explain words when readers tap them.
`word` is the form exactly as it appears in the text (matching ignores case); `lemma` is the dictionary form;
`gloss` has one entry per language (`en` is the fallback).

```yaml
vocabulary:
  - word: нясуць
    lemma: несці
    pos: verb
    gloss:
      en: they carry
```

## JSON Format (Auto-Generated)

The JSON files are **automatically generated** from Markdown using `build.py`.

### Generated Poetry JSON

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
        "У гэтай цемры ноччы?"
      ]
    }
  ],
  "translator": null,
  "translation_year": null,
  "notes": []
}
```

### Generated Prose JSON

```json
{
  "language": "en",
  "work_id": "my-story",
  "author_id": "author-name",
  "title": "My Story",
  "content_type": "prose",
  "structure": "paragraphs",
  "content": [
    {
      "type": "paragraph",
      "number": 1,
      "text": "This is the first paragraph..."
    },
    {
      "type": "paragraph",
      "number": 2,
      "text": "This is the second paragraph..."
    }
  ],
  "translator": "Translator Name",
  "translation_year": 2024,
  "notes": [
    {
      "reference": "paragraph:2",
      "text": "Historical context..."
    }
  ]
}
```

## Build Process

### Converting Markdown to JSON

Run the build script to convert all `.md` files to `.json`:

```bash
python3 build.py
```

**Output:**
```
Building JSON files from Markdown sources...

✓ Converted authors\kupala-yanka\works\who-goes-there\be.md -> authors\kupala-yanka\works\who-goes-there\content\be.json
✓ Converted authors\kupala-yanka\works\who-goes-there\en.md -> authors\kupala-yanka\works\who-goes-there\content\en.json

Converted 2 file(s)

✓ Build complete!
```

### How It Works

1. Finds all `.md` files in `content/authors/*/works/*/`
2. Parses YAML frontmatter
3. Parses content body (stanzas or paragraphs)
4. Generates corresponding `.json` file
5. Validates structure

### Validation

After building, validate the generated files:

```bash
python3 validate.py
```

This checks:
- JSON syntax is valid
- Required fields are present
- IDs match directory structure
- Language codes are valid

## Workflow

### For Content Authors

1. **Create/Edit Markdown file** - Easy, natural writing
2. **Run build script** - Generates JSON automatically
3. **Validate** - Ensures everything is correct
4. **Commit** - Only the Markdown source (`public/` is generated and gitignored)

### For Translators

1. **Copy original `.md` file** - Much easier than copying JSON
2. **Edit frontmatter** - Update title, translator
3. **Translate content** - Natural text editing
4. **Run build** - Generates JSON
5. **Submit PR** - Markdown sources only

### For Developers

- **Read JSON files** - Use for API consumption
- **Ignore Markdown files** - Optional, JSON has all data
- **Build locally** - `python3 build.py` generates `public/`; the website deploys it (see README)

## Best Practices

### DO ✅

- Write content in Markdown format
- Run `build.py` after editing Markdown
- Commit only the `.md` sources (`public/` is generated and gitignored)
- Use blank lines to separate stanzas/paragraphs
- Add notes in YAML frontmatter

### DON'T ❌

- Don't manually edit JSON files (they're auto-generated)
- Don't forget to run `build.py` before committing
- Don't mix formats (use Markdown as source of truth)
- Don't add line breaks within stanzas (use actual line breaks)

## Troubleshooting

### "Invalid frontmatter" Error

Make sure your file starts with `---` and has matching closing `---`:

```markdown
---
title: My Title
...
---

Content starts here
```

### "Unknown content_type" Error

Ensure `content_type` is either `poem` or `prose`:

```yaml
content_type: poem  # or 'prose'
```

### Missing Fields Error

Required frontmatter field:
- `title`

`language`, `work_id`, `author_id` and `content_type` are derived from the folder structure and `metadata.json`.

### Build Script Not Found

Install PyYAML dependency:

```bash
pip install pyyaml
```

## Migration from JSON-Only

If you have existing JSON files and want to convert to Markdown:

1. Create `.md` file with frontmatter from JSON metadata
2. Extract content and format as stanzas/paragraphs
3. Run `build.py` to regenerate JSON
4. Compare to ensure accuracy

## Summary

| Aspect | Markdown | JSON |
|--------|----------|------|
| **Purpose** | Source format for authors | API consumption |
| **Edit** | Yes - primary format | No - auto-generated |
| **Commit** | Yes | No (generated, gitignored) |
| **Read** | Easy - natural text | Structured data |
| **Create** | Manually | Via `build.py` |

**Remember**: Markdown is the **source of truth**. JSON files are generated artifacts for API consumption.
