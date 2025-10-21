# Awesome Belarusian Literature

> A community-driven collection of Belarusian literature with translations into multiple languages

[![CC0 License](https://img.shields.io/badge/license-CC0-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

## About

This repository contains classic and contemporary Belarusian literature translated into various languages by the community. Our goal is to make Belarusian literary works accessible to readers worldwide.

## Features

- 📚 **Structured Content**: Well-organized JSON format for easy parsing
- 🌍 **Multi-language Support**: Translations in multiple languages
- 🔍 **Searchable Metadata**: Rich metadata for authors and works
- 🎨 **Front-end Ready**: JSON structure designed for web applications
- 📖 **Translator Friendly**: Clear format for contributing translations
- 🚀 **GitHub Pages/Vercel Ready**: Can be consumed by static site generators

## Structure

```
awesome-bel-lit/
├── content/              # SOURCE - Content authors work here
│   └── authors/          # Author information and works
│       └── {author-id}/
│           ├── info.json     # Author metadata
│           └── works/
│               └── {work-id}/
│                   ├── metadata.json  # Work metadata (no IDs)
│                   ├── be.md          # Belarusian (Markdown)
│                   ├── en.md          # English (Markdown)
│                   └── ...
├── config/               # Configuration files
│   └── languages.json    # Supported languages
├── public/               # GENERATED - Built for front-end (auto-generated)
│   ├── authors/
│   │   └── {author-id}/
│   │       └── works/
│   │           └── {work-id}/
│   │               └── content/
│   │                   ├── be.json   # Auto-generated from be.md
│   │                   └── en.json   # Auto-generated from en.md
│   └── metadata/
│       ├── index.json    # AUTO-GENERATED from source
│       └── languages.json
└── build.py             # Converts content/ -> public/
```

## Quick Start

### Browse Content

```bash
# Clone the repository
git clone https://github.com/bthos/awesome-bel-lit.git
cd awesome-bel-lit

# Browse authors (source files)
ls content/authors/

# View an author's works
cat content/authors/kupala-yanka/info.json
ls content/authors/kupala-yanka/works/

# Read a work in Belarusian (Markdown - easy to read!)
cat content/authors/kupala-yanka/works/who-goes-there/be.md

# Build public files (generates JSON for front-end)
python3 build.py

# Or use the generated JSON
cat public/authors/kupala-yanka/works/who-goes-there/content/be.json
```

### Add a Translation

```bash
# 1. Copy the original in content/ directory
cd content/authors/kupala-yanka/works/who-goes-there/
cp be.md es.md  # For Spanish

# 2. Edit es.md - it's just Markdown with frontmatter!

# 3. Build JSON files
cd ../../../../
python3 build.py

# 4. Validate
python3 validate.py

# 5. Commit and submit PR
```

### Use in Your Application

```javascript
// Fetch author information from public directory
const response = await fetch(
  'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/authors/kupala-yanka/info.json'
);
const author = await response.json();
console.log(author.names.en); // "Yanka Kupala"

// Fetch a work
const work = await fetch(
  'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/authors/kupala-yanka/works/who-goes-there/content/en.json'
);
const content = await work.json();
console.log(content.title); // "Who Goes There?"

// Fetch the auto-generated index
const indexResp = await fetch(
  'https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/public/metadata/index.json'
);
const index = await indexResp.json();
console.log(index.authors); // All authors with their works
```

## Contributing

We welcome contributions! Here's how you can help:

1. 🌐 **Translate works** - Write in easy-to-edit **Markdown format**
2. ✍️ **Add new works** by existing authors
3. 👤 **Add new authors** and their works
4. ✏️ **Improve existing translations**
5. 🐛 **Fix errors** in content or metadata

**New!** Content is now written in **Markdown** (much easier than JSON!) and automatically converted to JSON for API use. See [FORMAT.md](FORMAT.md) for details.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [FORMAT.md](FORMAT.md) - **NEW!** Markdown vs JSON format guide
- [STRUCTURE.md](STRUCTURE.md) - Detailed structure and naming conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [LICENSE](LICENSE) - CC0 1.0 Universal (Public Domain)

## Current Content

### Authors

- **Yanka Kupala** (1882-1942) - Классік беларускай літаратуры
  - "Who Goes There?" / "Хто там ідзе?" (1913) - Available in: Belarusian, English

*More authors and works coming soon! Contribute to help expand the collection.*

## Translation Progress

| Work | Original | Available Languages | Needed |
|------|----------|-------------------|--------|
| Who Goes There? | 🇧🇾 Belarusian | 🇬🇧 English | 🇷🇺 🇵🇱 🇩🇪 🇫🇷 🇪🇸 |

## For Front-End Developers

### GitHub Pages Example

```yaml
# Deploy with GitHub Pages
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build site
        run: |
          # Your build script using the JSON files
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Vercel Example

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## API Usage

All content is accessible via GitHub's raw content URL:

```
https://raw.githubusercontent.com/bthos/awesome-bel-lit/main/{path}
```

### Endpoints

- Author info: `/authors/{author-id}/info.json`
- Work metadata: `/authors/{author-id}/works/{work-id}/metadata.json`
- Work content: `/authors/{author-id}/works/{work-id}/content/{lang}.json`
- Languages list: `/metadata/languages.json`
- Complete index: `/metadata/index.json`
- Translation status: `/translations/status.json`

## License

All content in this repository is dedicated to the public domain under the [CC0 1.0 Universal](LICENSE) license. This means you can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

## Support

- 📖 Read the [documentation](STRUCTURE.md)
- 💬 Open an [issue](https://github.com/bthos/awesome-bel-lit/issues)
- 🤝 Submit a [pull request](https://github.com/bthos/awesome-bel-lit/pulls)

## Acknowledgments

Thanks to all contributors who help preserve and share Belarusian literature with the world! 🇧🇾

---

**Made with ❤️ by the Belarusian literature community**
