#!/usr/bin/env python3
"""
Build script to convert Markdown content files to JSON format.
This allows content authors to write in Markdown (easier) while maintaining
JSON files for API consumption.
"""

import json
import os
import re
from pathlib import Path
import yaml


def parse_markdown_content(markdown_path):
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
    frontmatter = yaml.safe_load(parts[1])
    text_content = parts[2].strip()
    
    # Parse content based on type
    if frontmatter.get('content_type') == 'poem':
        parsed_content = parse_poem(text_content)
    elif frontmatter.get('content_type') == 'prose':
        parsed_content = parse_prose(text_content)
    else:
        raise ValueError(f"Unknown content_type: {frontmatter.get('content_type')}")
    
    # Build JSON structure
    json_data = {
        "language": frontmatter['language'],
        "work_id": frontmatter['work_id'],
        "author_id": frontmatter['author_id'],
        "title": frontmatter['title'],
        "content_type": frontmatter['content_type'],
        "structure": "stanzas" if frontmatter['content_type'] == 'poem' else "paragraphs",
        "content": parsed_content,
        "translator": frontmatter.get('translator'),
        "translation_year": frontmatter.get('translation_year'),
        "notes": frontmatter.get('notes', [])
    }
    
    return json_data


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


def build_json_files(repo_root):
    """Build all JSON files from Markdown sources."""
    authors_dir = repo_root / 'authors'
    
    if not authors_dir.exists():
        print("No 'authors' directory found")
        return
    
    converted_count = 0
    
    # Find all .md files in content directories
    for md_file in authors_dir.glob('*/works/*/content/*.md'):
        # Generate corresponding JSON file path
        json_file = md_file.with_suffix('.json')
        
        try:
            # Parse Markdown and generate JSON
            json_data = parse_markdown_content(md_file)
            
            # Write JSON file
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            print(f"✓ Converted {md_file.relative_to(repo_root)} -> {json_file.name}")
            converted_count += 1
            
        except Exception as e:
            print(f"✗ Error converting {md_file.relative_to(repo_root)}: {e}")
    
    print(f"\nConverted {converted_count} file(s)")


def main():
    """Main entry point."""
    repo_root = Path(__file__).parent
    print(f"Building JSON files from Markdown sources...\n")
    build_json_files(repo_root)
    print("\n✓ Build complete!")


if __name__ == '__main__':
    main()
