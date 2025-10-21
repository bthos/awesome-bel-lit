# Quick Reference Guide

A quick reference for common tasks when working with the repository.

## For Translators

### Translate a poem

```bash
# 1. Navigate to the work
cd authors/{author-id}/works/{work-id}/content/

# 2. Copy the original
cp be.json es.json  # For Spanish

# 3. Edit es.json with your translation
# - Change "language": "es"
# - Translate "title"
# - Translate all lines in "content"
# - Add your name in "translator"
# - Add year in "translation_year"

# 4. Update metadata
cd ..
# Edit metadata.json: add "es" to available_translations

# 5. Validate
cd ../../../../
python3 validate.py

# 6. Commit
git add .
git commit -m "Add Spanish translation of {work-name}"
git push
```

### Translate prose

Same as poetry, but structure is different:
```json
{
  "content": [
    {
      "type": "paragraph",
      "number": 1,
      "text": "Translated paragraph text..."
    }
  ]
}
```

## For Content Editors

### Add a new author

```bash
# 1. Create directory structure
mkdir -p authors/lastname-firstname/works

# 2. Create author info
cat > authors/lastname-firstname/info.json << 'EOF'
{
  "id": "lastname-firstname",
  "names": {
    "be": "Імя Прозвішча",
    "en": "Name Surname"
  },
  "biography": {
    "be": "Біяграфія...",
    "en": "Biography..."
  },
  "birth_year": 1900,
  "death_year": 1980,
  "image_url": "",
  "external_links": {
    "wikipedia": {
      "be": "https://be.wikipedia.org/wiki/...",
      "en": "https://en.wikipedia.org/wiki/..."
    }
  }
}
EOF

# 3. Validate
python3 validate.py
```

### Add a new work

```bash
# 1. Create directory structure
mkdir -p authors/{author-id}/works/{work-id}/content

# 2. Create metadata
cat > authors/{author-id}/works/{work-id}/metadata.json << 'EOF'
{
  "id": "work-id",
  "author_id": "author-id",
  "type": "poem",
  "titles": {
    "be": "Назва",
    "en": "Title"
  },
  "year_written": 1920,
  "year_published": 1920,
  "original_language": "be",
  "available_translations": ["be"],
  "tags": {
    "be": ["паэзія"],
    "en": ["poetry"]
  }
}
EOF

# 3. Add Belarusian content
cat > authors/{author-id}/works/{work-id}/content/be.json << 'EOF'
{
  "language": "be",
  "work_id": "work-id",
  "author_id": "author-id",
  "title": "Назва",
  "content_type": "poem",
  "structure": "stanzas",
  "content": [
    {
      "type": "stanza",
      "number": 1,
      "lines": [
        "First line",
        "Second line"
      ]
    }
  ],
  "translator": null,
  "translation_year": null,
  "notes": []
}
EOF

# 4. Validate
python3 validate.py
```

## For Developers

### Fetch all authors

```bash
curl https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/metadata/index.json | jq '.authors'
```

### Fetch author info

```bash
curl https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/kupala-yanka/info.json | jq '.names'
```

### Fetch work content

```bash
curl https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/kupala-yanka/works/who-goes-there/content/en.json | jq '.title'
```

### Get translation status

```bash
curl https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/translations/status.json | jq '.works'
```

### Test locally with Python

```python
import json
import requests

# Load index
index = requests.get(
    'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/metadata/index.json'
).json()

# Get first author
author_id = index['authors'][0]['id']

# Load author info
author = requests.get(
    f'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/{author_id}/info.json'
).json()

print(f"Author: {author['names']['en']}")
```

### Test locally with JavaScript/Node

```javascript
const fetch = require('node-fetch');

async function loadAuthor(authorId, language = 'en') {
  const response = await fetch(
    `https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/authors/${authorId}/info.json`
  );
  const data = await response.json();
  return {
    name: data.names[language],
    bio: data.biography[language]
  };
}

loadAuthor('kupala-yanka').then(console.log);
```

## Validation

### Validate all files

```bash
python3 validate.py
```

### Validate specific JSON file

```bash
python3 -m json.tool authors/kupala-yanka/info.json
```

### Check for common errors

```bash
# Check for missing translations in metadata
for metadata in authors/*/works/*/metadata.json; do
  echo "Checking $metadata"
  cat "$metadata" | jq '.available_translations'
done

# List all available languages
find authors -name "*.json" -path "*/content/*" | sed 's/.*\///' | sed 's/\.json$//' | sort -u
```

## Git Workflow

### Standard contribution

```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/awesome-bel-lit.git
cd awesome-bel-lit

# 2. Create branch
git checkout -b add-spanish-translation

# 3. Make changes
# ... edit files ...

# 4. Validate
python3 validate.py

# 5. Commit
git add .
git commit -m "Add Spanish translation of Who Goes There?"

# 6. Push
git push origin add-spanish-translation

# 7. Create Pull Request on GitHub
```

### Update from upstream

```bash
# Add upstream remote (once)
git remote add upstream https://github.com/bthos/awesome-bel-lit.git

# Fetch and merge
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Common File Locations

- Author info: `authors/{author-id}/info.json`
- Work metadata: `authors/{author-id}/works/{work-id}/metadata.json`
- Work content: `authors/{author-id}/works/{work-id}/content/{lang}.json`
- Languages list: `metadata/languages.json`
- Repository index: `metadata/index.json`
- Translation status: `translations/status.json`

## Naming Conventions Quick Reference

- **Author IDs**: `lastname-firstname` (lowercase, Latin, hyphens)
  - ✓ `kupala-yanka`, `kolos-yakub`
  - ✗ `Yanka_Kupala`, `янка-купала`

- **Work IDs**: `short-english-title` (lowercase, hyphens, 2-5 words)
  - ✓ `who-goes-there`, `new-land`
  - ✗ `Хто-там-ідзе`, `who_goes_there`

- **Language codes**: ISO 639-1 two-letter codes
  - ✓ `be`, `en`, `ru`, `pl`
  - ✗ `bel`, `eng`, `belarusian`

## Tips

- Always validate before committing
- Keep original line breaks in poetry
- Add cultural notes when needed
- Credit yourself as translator
- Check existing examples
- Ask for help in issues

## Resources

- [Full Structure Documentation](STRUCTURE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Deployment Guide](DEPLOYMENT.md)
