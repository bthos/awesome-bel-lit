#!/usr/bin/env python3
"""
Build script to generate public-facing files from source content.

This script:
1. Converts Markdown content files to JSON format
2. Copies source files to public directory
3. Auto-generates metadata/index.json from source content

Directory structure:
- content/        - SOURCE (what content authors edit)
- public/         - GENERATED + CONFIGURATION (what front-end consumes)
"""

import json
import os
import shutil
from pathlib import Path
import yaml
from datetime import datetime


def parse_markdown_content(markdown_path, author_id, work_id, lang_code, work_metadata):
    """Parse a Markdown content file and extract metadata and content."""
    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split frontmatter and content
    if not content.startswith('---'):
        raise ValueError(f"File {markdown_path} must start with YAML frontmatter")
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        raise ValueError(f"Invalid frontmatter in {markdown_path}")
    
    # Parse YAML frontmatter
    frontmatter = yaml.safe_load(parts[1]) or {}
    text_content = parts[2].strip()
    
    # Get content_type from metadata.json
    content_type = work_metadata.get('type', 'poem')
    
    # Parse content based on type
    if content_type == 'poem':
        parsed_content = parse_poem(text_content)
    elif content_type == 'prose':
        parsed_content = parse_prose(text_content)
    else:
        raise ValueError(f"Unknown content_type: {content_type}")
    
    # Build JSON structure
    # Derive IDs from folder structure instead of frontmatter
    json_data = {
        "language": lang_code,  # From filename
        "work_id": work_id,      # From folder name
        "author_id": author_id,  # From folder name
        "title": frontmatter.get('title', ''),
        "content_type": content_type,  # From metadata.json
        "structure": "stanzas" if content_type == 'poem' else "paragraphs",
        "content": parsed_content,
        "translator": frontmatter.get('translator'),
        "translation_year": frontmatter.get('translation_year'),
        "tags": frontmatter.get('tags', []),  # From .md frontmatter
        "notes": frontmatter.get('notes', [])
    }
    
    return json_data, frontmatter


def parse_poem(text):
    """Parse poem text into stanzas."""
    stanzas = []
    stanza_texts = text.split('\n\n')
    
    for i, stanza_text in enumerate(stanza_texts, 1):
        lines = [line.strip() for line in stanza_text.split('\n') if line.strip()]
        if lines:
            stanzas.append({
                "type": "stanza",
                "number": i,
                "lines": lines
            })
    
    return stanzas


def parse_prose(text):
    """Parse prose text into paragraphs."""
    paragraphs = []
    para_texts = text.split('\n\n')
    
    for i, para_text in enumerate(para_texts, 1):
        para_text = para_text.strip()
        if para_text:
            paragraphs.append({
                "type": "paragraph",
                "number": i,
                "text": para_text
            })
    
    return paragraphs


def build_public_files(repo_root):
    """Build all public files from source content."""
    content_dir = repo_root / 'content'
    public_dir = repo_root / 'public'
    
    if not content_dir.exists():
        print("Error: 'content' directory not found")
        return
    
    # Clean and recreate public directory (except languages.json)
    if public_dir.exists():
        # Save languages.json if it exists
        languages_file = public_dir / 'languages.json'
        languages_data = None
        if languages_file.exists():
            with open(languages_file, 'r', encoding='utf-8') as f:
                languages_data = f.read()
        
        shutil.rmtree(public_dir)
        public_dir.mkdir(parents=True)
        
        # Restore languages.json
        if languages_data:
            with open(languages_file, 'w', encoding='utf-8') as f:
                f.write(languages_data)
    else:
        public_dir.mkdir(parents=True)
    
    authors_dir = content_dir / 'authors'
    if not authors_dir.exists():
        print("Error: 'content/authors' directory not found")
        return
    
    converted_count = 0
    authors_data = []
    
    # Process each author
    for author_dir in sorted(authors_dir.iterdir()):
        if not author_dir.is_dir():
            continue
        
        author_id = author_dir.name  # Derive from folder name
        author_info_file = author_dir / 'info.json'
        
        if not author_info_file.exists():
            continue
        
        # Load author info
        with open(author_info_file, 'r', encoding='utf-8') as f:
            author_info = json.load(f)
        
        # Copy author info to public
        public_author_dir = public_dir / 'authors' / author_id
        public_author_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(author_info_file, public_author_dir / 'info.json')
        
        works_dir = author_dir / 'works'
        if not works_dir.exists():
            continue
        
        works_data = []
        
        # Process each work
        for work_dir in sorted(works_dir.iterdir()):
            if not work_dir.is_dir():
                continue
            
            work_id = work_dir.name  # Derive from folder name
            metadata_file = work_dir / 'metadata.json'
            
            if not metadata_file.exists():
                continue
            
            # Load work metadata
            with open(metadata_file, 'r', encoding='utf-8') as f:
                work_metadata = json.load(f)
            
            # Add derived IDs to metadata for public output
            work_metadata_public = work_metadata.copy()
            work_metadata_public['id'] = work_id
            work_metadata_public['author_id'] = author_id
            
            # Copy work metadata to public
            public_work_dir = public_author_dir / 'works' / work_id
            public_work_dir.mkdir(parents=True, exist_ok=True)
            
            with open(public_work_dir / 'metadata.json', 'w', encoding='utf-8') as f:
                json.dump(work_metadata_public, f, ensure_ascii=False, indent=2)
            
            # Create content directory in public
            public_content_dir = public_work_dir / 'content'
            public_content_dir.mkdir(exist_ok=True)
            
            # Find all .md files and convert to JSON
            # Also collect titles and tags from .md files
            available_languages = []
            titles_by_lang = {}
            tags_by_lang = {}
            
            for md_file in sorted(work_dir.glob('*.md')):
                try:
                    # Get language code from filename
                    lang_code = md_file.stem
                    available_languages.append(lang_code)
                    
                    # Parse Markdown and generate JSON
                    json_data, frontmatter = parse_markdown_content(
                        md_file, author_id, work_id, lang_code, work_metadata
                    )
                    
                    # Collect titles and tags for index
                    if 'title' in frontmatter:
                        titles_by_lang[lang_code] = frontmatter['title']
                    if 'tags' in frontmatter:
                        tags_by_lang[lang_code] = frontmatter['tags']
                    
                    # Write JSON file to public directory
                    json_file = public_content_dir / f'{lang_code}.json'
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(json_data, f, ensure_ascii=False, indent=2)
                    
                    print(f"✓ Converted {md_file.relative_to(content_dir)} -> {json_file.relative_to(public_dir)}")
                    converted_count += 1
                    
                except Exception as e:
                    print(f"✗ Error converting {md_file.relative_to(content_dir)}: {e}")
            
            # Add work to index with titles and tags from .md files
            work_index_entry = {
                "id": work_id,
                "type": work_metadata.get('type', 'unknown'),
                "year": work_metadata.get('year_written'),
                "available_languages": available_languages
            }
            
            # Add titles if collected
            if titles_by_lang:
                work_index_entry['titles'] = titles_by_lang
            
            # Add tags if collected
            if tags_by_lang:
                work_index_entry['tags'] = tags_by_lang
            
            works_data.append(work_index_entry)
        
        # Add author to index
        authors_data.append({
            "id": author_id,
            "name": author_info.get('names', {}),
            "works_count": len(works_data),
            "works": works_data
        })
    
    # Generate index.json
    index_data = {
        "version": "1.0.0",
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
        "authors": authors_data,
        "statistics": {
            "total_authors": len(authors_data),
            "total_works": sum(a['works_count'] for a in authors_data),
            "total_translations": converted_count,
            "languages_with_content": list(set(
                lang for author in authors_data 
                for work in author['works'] 
                for lang in work['available_languages']
            ))
        }
    }
    
    # Write index.json to public/metadata/
    public_metadata_dir = public_dir / 'metadata'
    public_metadata_dir.mkdir(parents=True, exist_ok=True)
    
    with open(public_metadata_dir / 'index.json', 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Generated metadata/index.json")
    
    # Languages.json is already in public/ (manually maintained configuration)
    languages_file = public_dir / 'languages.json'
    if languages_file.exists():
        print(f"✓ Using languages.json from public/")
    else:
        print(f"⚠ Warning: public/languages.json not found")
    
    print(f"\n✓ Converted {converted_count} file(s)")
    print(f"✓ Generated index with {len(authors_data)} author(s)")


def main():
    """Main entry point."""
    repo_root = Path(__file__).parent
    print(f"Building public files from source content...\n")
    build_public_files(repo_root)
    print("\n✓ Build complete!")


if __name__ == '__main__':
    main()
