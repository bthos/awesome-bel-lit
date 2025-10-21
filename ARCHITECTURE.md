# Architecture Overview

This document provides a high-level overview of the repository architecture and how it all fits together.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Repository                             │
│                  (bthos/awesome-bel-lit)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Authors    │  │   Metadata   │  │ Translations │         │
│  │              │  │              │  │              │         │
│  │ - Author     │  │ - Languages  │  │ - Status     │         │
│  │   Info       │  │ - Index      │  │ - Progress   │         │
│  │ - Works      │  │              │  │              │         │
│  │   - Content  │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Git API / Raw Content
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │    │    Vercel    │    │   Direct     │
│    Pages     │    │  Deployment  │    │   Fetch      │
│              │    │              │    │              │
│ Static Site  │    │  SSR/SSG     │    │  Client-side │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   End Users  │
                    │              │
                    │ 🇧🇾 🇬🇧 🇷🇺 🇵🇱│
                    └──────────────┘
```

## Data Flow

### Content Addition Flow

```
Contributor
    │
    ├─► 1. Fork Repository
    │
    ├─► 2. Add/Translate Content
    │       - Create JSON files
    │       - Follow naming conventions
    │       - Update metadata
    │
    ├─► 3. Validate Locally
    │       python3 validate.py
    │
    ├─► 4. Submit Pull Request
    │
    └─► 5. CI Validation
            - GitHub Actions runs
            - JSON validation
            - Structure check
            │
            ├─► ✓ Pass → Merge
            └─► ✗ Fail → Request changes
```

### Content Consumption Flow

```
Front-end Application
    │
    ├─► 1. Fetch Index
    │       GET /metadata/index.json
    │
    ├─► 2. List Authors
    │       GET /authors/{author-id}/info.json
    │
    ├─► 3. Get Works
    │       GET /authors/{author-id}/works/{work-id}/metadata.json
    │
    └─► 4. Load Content
            GET /authors/{author-id}/works/{work-id}/content/{lang}.json
            │
            ├─► Translation exists → Display
            └─► Translation missing → Fallback to 'be'
```

## Directory Structure Explained

### `/authors/`
The main content directory. Each author has their own subdirectory.

```
authors/
└── {author-id}/              # Unique author identifier
    ├── info.json             # Author metadata (multi-language)
    └── works/                # All works by this author
        └── {work-id}/        # Unique work identifier
            ├── metadata.json # Work metadata (multi-language)
            └── content/      # Content files
                ├── be.json   # Original (Belarusian)
                ├── en.json   # English translation
                ├── ru.json   # Russian translation
                └── ...       # Other translations
```

**Why this structure?**
- Language-agnostic IDs enable easy cross-referencing
- Flat structure is easy to navigate
- Each work is self-contained
- Adding new languages requires only adding a new file

### `/metadata/`
Repository-wide information.

```
metadata/
├── languages.json   # List of all supported languages
└── index.json       # Complete index of all content
```

**Purpose:**
- `languages.json`: UI language selectors, validation
- `index.json`: Quick overview, navigation, search

### `/translations/`
Translation progress tracking.

```
translations/
└── status.json      # Current translation status
```

**Purpose:**
- Track which works need translations
- Show translation progress
- Acknowledge translators

## JSON Schema Design

### Why JSON?

1. **Universal Format**: Parsable by any programming language
2. **Structured Data**: Enforces consistency
3. **API-Ready**: Direct consumption by web apps
4. **Git-Friendly**: Text format, good diffs
5. **Validatable**: Can enforce schema

### Content Structure for Poetry

```json
{
  "content": [
    {
      "type": "stanza",
      "number": 1,
      "lines": ["line1", "line2"]
    }
  ]
}
```

**Why stanzas and lines?**
- Preserves structure
- Enables line-by-line comparison
- Flexible rendering (side-by-side, verses, etc.)
- Translators can match original structure

### Content Structure for Prose

```json
{
  "content": [
    {
      "type": "paragraph",
      "number": 1,
      "text": "Full paragraph text..."
    }
  ]
}
```

**Why paragraphs?**
- Natural prose units
- Easy to reference
- Enables notes and annotations
- Maintains readability

## Naming Convention Rationale

### Author IDs: `lastname-firstname`

**Examples:** `kupala-yanka`, `kolos-yakub`

**Why?**
- ✓ Language-agnostic (Latin alphabet)
- ✓ URL-friendly
- ✓ Easy to type
- ✓ Sortable
- ✓ Unique identifiers

### Work IDs: `short-english-title`

**Examples:** `who-goes-there`, `new-land`

**Why?**
- ✓ Descriptive
- ✓ URL-friendly
- ✓ Internationally recognizable
- ✓ Easy to reference in code
- ✓ Shorter than full titles

### Language Codes: ISO 639-1

**Examples:** `be`, `en`, `ru`, `pl`

**Why?**
- ✓ International standard
- ✓ Short (2 letters)
- ✓ Universally recognized
- ✓ Supported by browsers/frameworks

## Front-End Integration Strategies

### Strategy 1: Direct Fetch (Client-Side)

**Pros:**
- Simple to implement
- No build step needed
- Always up-to-date

**Cons:**
- Slower initial load
- Multiple HTTP requests
- CORS considerations

### Strategy 2: Build-Time Generation (SSG)

**Pros:**
- Fast page loads
- SEO-friendly
- Offline capable

**Cons:**
- Requires rebuild for updates
- More complex setup

### Strategy 3: Server-Side Rendering (SSR)

**Pros:**
- SEO-friendly
- Dynamic content
- Fast perceived load

**Cons:**
- Requires server
- More complex infrastructure

## Validation Strategy

### Automated Validation

```yaml
GitHub Actions Workflow
    │
    ├─► JSON Syntax Validation
    │       - All .json files must be valid JSON
    │
    ├─► Structure Validation
    │       - Required fields present
    │       - IDs match directory names
    │       - Language codes valid
    │
    └─► Consistency Validation
            - available_translations matches files
            - Author/work IDs consistent
            - No duplicate IDs
```

### Manual Review

Pull requests should also check:
- Translation quality
- Copyright/licensing
- Biographical accuracy
- Proper attributions

## Scalability Considerations

### Current Design Supports:

- **100s of authors**: Flat directory structure
- **1000s of works**: Organized by author
- **Dozens of languages**: One file per language
- **Multiple translators**: Tracked in content files

### Future Optimizations:

1. **Content Delivery Network (CDN)**: Cache JSON files
2. **Search Index**: Build search index at commit time
3. **Compressed Archives**: Offer bulk downloads
4. **API Gateway**: Add rate limiting, caching
5. **Database Mirror**: For complex queries

## Security Considerations

### Current Protections:

1. **Public Domain Content**: All content CC0 licensed
2. **Validation**: Prevents malformed data
3. **Review Process**: Pull request reviews
4. **No Executables**: Only JSON/Markdown files

### Best Practices:

1. Don't commit sensitive information
2. Validate all contributions
3. Review external links
4. Check translator attributions
5. Respect copyright laws

## Extension Points

### Adding New Content Types

To add support for plays, essays, etc.:

1. Add new `content_type` value
2. Define structure in STRUCTURE.md
3. Create example
4. Update validation script
5. Update front-end renderers

### Adding New Metadata

To add ratings, comments, etc.:

1. Extend JSON schema
2. Update STRUCTURE.md
3. Update validation script
4. Maintain backward compatibility

### Internationalization

All text fields support multiple languages:
```json
{
  "field": {
    "be": "Беларуская",
    "en": "English",
    "ru": "Русский"
  }
}
```

Add new languages by adding new keys.

## Performance Metrics

### File Sizes (Typical)

- Author info: ~1-2 KB
- Work metadata: ~500 bytes
- Short poem: ~1-2 KB
- Long work: ~10-50 KB

### Load Times (Estimated)

- Index: < 1s
- Author list: < 2s
- Single work: < 1s
- Full author: 2-5s (depending on works)

### Optimization Tips

1. Lazy load content
2. Cache in localStorage
3. Use service workers
4. Implement pagination
5. Compress JSON files

## Maintenance

### Regular Tasks

1. **Update index.json**: When adding content
2. **Update status.json**: Track translations
3. **Run validation**: Before committing
4. **Review PRs**: Check quality
5. **Update documentation**: Keep in sync

### Monitoring

Track via GitHub:
- Pull request frequency
- Contributor count
- Content growth
- Translation coverage

## Conclusion

This architecture provides:
- ✓ Simple, flat structure
- ✓ Language-agnostic design
- ✓ Multi-platform compatibility
- ✓ Easy contribution workflow
- ✓ Scalable to large collections
- ✓ Front-end friendly

The JSON-based approach with clear naming conventions makes the repository accessible to both humans and machines, supporting the goal of making Belarusian literature accessible worldwide.
