#!/usr/bin/env python3
"""
Validation script for awesome-bel-lit repository structure.
Checks JSON files for validity and structure consistency in the PUBLIC directory.
"""

import json
import os
import sys
from pathlib import Path


def validate_json_file(filepath):
    """Validate that a file contains valid JSON."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        return True, None
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    except Exception as e:
        return False, f"Error reading file: {e}"


def validate_author_info(filepath, author_id):
    """Validate author info.json structure."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    errors = []
    
    # Check required fields
    required_fields = ['id', 'names', 'biography', 'birth_year']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check ID matches directory
    if data.get('id') != author_id:
        errors.append(f"Author ID mismatch: {data.get('id')} != {author_id}")
    
    # Check names structure
    if 'names' in data and not isinstance(data['names'], dict):
        errors.append("'names' must be an object with language codes")
    
    # Check biography structure
    if 'biography' in data and not isinstance(data['biography'], dict):
        errors.append("'biography' must be an object with language codes")
    
    return errors


def validate_work_metadata(filepath, author_id, work_id):
    """Validate work metadata.json structure."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    errors = []
    
    # Check required fields
    required_fields = ['id', 'author_id', 'type', 'titles', 'original_language']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check IDs match
    if data.get('id') != work_id:
        errors.append(f"Work ID mismatch: {data.get('id')} != {work_id}")
    if data.get('author_id') != author_id:
        errors.append(f"Author ID mismatch: {data.get('author_id')} != {author_id}")
    
    # Check titles structure
    if 'titles' in data and not isinstance(data['titles'], dict):
        errors.append("'titles' must be an object with language codes")
    
    return errors


def validate_work_content(filepath, work_id, author_id, lang_code):
    """Validate work content file structure."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    errors = []
    
    # Check required fields
    required_fields = ['language', 'work_id', 'author_id', 'title', 'content_type', 'structure', 'content']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check IDs match
    if data.get('work_id') != work_id:
        errors.append(f"Work ID mismatch: {data.get('work_id')} != {work_id}")
    if data.get('author_id') != author_id:
        errors.append(f"Author ID mismatch: {data.get('author_id')} != {author_id}")
    if data.get('language') != lang_code:
        errors.append(f"Language code mismatch: {data.get('language')} != {lang_code}")
    
    # Check content is an array
    if 'content' in data and not isinstance(data['content'], list):
        errors.append("'content' must be an array")
    
    return errors


def main():
    """Main validation function."""
    repo_root = Path(__file__).parent
    public_dir = repo_root / 'public'
    
    if not public_dir.exists():
        print("Error: 'public' directory not found. Run 'python3 build.py' first.")
        sys.exit(1)
    
    authors_dir = public_dir / 'authors'
    if not authors_dir.exists():
        print("Error: 'public/authors' directory not found")
        sys.exit(1)
    
    total_files = 0
    invalid_files = 0
    errors_found = []
    
    print("Validating repository structure...\n")
    
    # Validate each author
    for author_dir in authors_dir.iterdir():
        if not author_dir.is_dir():
            continue
        
        author_id = author_dir.name
        info_file = author_dir / 'info.json'
        
        # Validate author info
        if info_file.exists():
            total_files += 1
            valid, error = validate_json_file(info_file)
            if not valid:
                invalid_files += 1
                errors_found.append(f"{info_file}: {error}")
            else:
                # Validate structure
                errors = validate_author_info(info_file, author_id)
                if errors:
                    invalid_files += 1
                    for err in errors:
                        errors_found.append(f"{info_file}: {err}")
        
        # Validate works
        works_dir = author_dir / 'works'
        if works_dir.exists():
            for work_dir in works_dir.iterdir():
                if not work_dir.is_dir():
                    continue
                
                work_id = work_dir.name
                metadata_file = work_dir / 'metadata.json'
                
                # Validate work metadata
                if metadata_file.exists():
                    total_files += 1
                    valid, error = validate_json_file(metadata_file)
                    if not valid:
                        invalid_files += 1
                        errors_found.append(f"{metadata_file}: {error}")
                    else:
                        errors = validate_work_metadata(metadata_file, author_id, work_id)
                        if errors:
                            invalid_files += 1
                            for err in errors:
                                errors_found.append(f"{metadata_file}: {err}")
                
                # Validate content files
                content_dir = work_dir / 'content'
                if content_dir.exists():
                    for content_file in content_dir.glob('*.json'):
                        total_files += 1
                        lang_code = content_file.stem
                        valid, error = validate_json_file(content_file)
                        if not valid:
                            invalid_files += 1
                            errors_found.append(f"{content_file}: {error}")
                        else:
                            errors = validate_work_content(content_file, work_id, author_id, lang_code)
                            if errors:
                                invalid_files += 1
                                for err in errors:
                                    errors_found.append(f"{content_file}: {err}")
    
    # Validate metadata files
    metadata_dir = public_dir / 'metadata'
    if metadata_dir.exists():
        for metadata_file in metadata_dir.glob('*.json'):
            total_files += 1
            valid, error = validate_json_file(metadata_file)
            if not valid:
                invalid_files += 1
                errors_found.append(f"{metadata_file}: {error}")
    
    # Print results
    print(f"Validation complete!")
    print(f"Total files checked: {total_files}")
    print(f"Invalid files: {invalid_files}")
    
    if errors_found:
        print("\nErrors found:")
        for error in errors_found:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("\n✓ All files are valid!")
        sys.exit(0)


if __name__ == '__main__':
    main()
