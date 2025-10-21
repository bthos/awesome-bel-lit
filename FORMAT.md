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

### Prose Example

```markdown
---
language: en
work_id: my-story
author_id: author-name
title: My Story
content_type: prose
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

All Markdown files **must** start with YAML frontmatter between `---` markers:

```yaml
---
language: en              # ISO 639-1 language code
work_id: work-identifier  # Matches directory name
author_id: author-id      # Matches author directory
title: Work Title         # Translated title
content_type: poem        # 'poem' or 'prose'
translator: Name          # Translator name (or null for original)
translation_year: 2024    # Year translated (or null)
notes:                    # Optional cultural/translation notes
  - reference: stanza:2
    text: Note text here
---
```

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

✓ Converted authors/kupala-yanka/works/who-goes-there/content/be.md -> be.json
✓ Converted authors/kupala-yanka/works/who-goes-there/content/en.md -> en.json

Converted 2 file(s)

✓ Build complete!
```

### How It Works

1. Finds all `.md` files in `authors/*/works/*/content/`
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
4. **Commit both** - Markdown and JSON files

### For Translators

1. **Copy original `.md` file** - Much easier than copying JSON
2. **Edit frontmatter** - Update language, title, translator
3. **Translate content** - Natural text editing
4. **Run build** - Generates JSON
5. **Submit PR** - Both formats included

### For Developers

- **Read JSON files** - Use for API consumption
- **Ignore Markdown files** - Optional, JSON has all data
- **Fetch from GitHub** - Use raw content URLs

## Best Practices

### DO ✅

- Write content in Markdown format
- Run `build.py` after editing Markdown
- Commit both `.md` and `.json` files
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
language: en
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

Required frontmatter fields:
- `language`
- `work_id`
- `author_id`
- `title`
- `content_type`

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
| **Commit** | Yes | Yes |
| **Read** | Easy - natural text | Structured data |
| **Create** | Manually | Via `build.py` |

**Remember**: Markdown is the **source of truth**. JSON files are generated artifacts for API consumption.
