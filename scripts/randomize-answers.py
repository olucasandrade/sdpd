#!/usr/bin/env python3

import json
import os
import random
from pathlib import Path

def shuffle_answers(options):
    """Shuffle array while preserving object references"""
    shuffled = list(options)
    random.shuffle(shuffled)
    return shuffled

def process_case(case_data):
    """Randomize answer options in a case"""
    # Shuffle root cause options
    if 'diagnosis' in case_data and 'rootCause' in case_data['diagnosis']:
        if 'options' in case_data['diagnosis']['rootCause']:
            case_data['diagnosis']['rootCause']['options'] = shuffle_answers(
                case_data['diagnosis']['rootCause']['options']
            )

    # Shuffle fix options
    if 'diagnosis' in case_data and 'fix' in case_data['diagnosis']:
        if 'options' in case_data['diagnosis']['fix']:
            case_data['diagnosis']['fix']['options'] = shuffle_answers(
                case_data['diagnosis']['fix']['options']
            )

    return case_data

# Process all case files
cases_dir = Path('/Users/lucasandrade/sdpd/src/data/cases')
processed = 0
errors = []

# Get all case files
case_files = sorted(cases_dir.glob('case-*.json'))

for case_file in case_files:
    try:
        with open(case_file, 'r', encoding='utf-8') as f:
            case_data = json.load(f)

        shuffled = process_case(case_data)

        with open(case_file, 'w', encoding='utf-8') as f:
            json.dump(shuffled, f, indent=2, ensure_ascii=False)

        processed += 1
        print(f'✓ {case_file.name} - answers shuffled')
    except Exception as e:
        errors.append(f'{case_file.name}: {str(e)}')
        print(f'✗ {case_file.name} - {str(e)}')

# Process Portuguese versions
pt_br_dir = cases_dir / 'pt-BR'
if pt_br_dir.exists():
    pt_case_files = sorted(pt_br_dir.glob('case-*.json'))

    for case_file in pt_case_files:
        try:
            with open(case_file, 'r', encoding='utf-8') as f:
                case_data = json.load(f)

            shuffled = process_case(case_data)

            with open(case_file, 'w', encoding='utf-8') as f:
                json.dump(shuffled, f, indent=2, ensure_ascii=False)

            processed += 1
            print(f'✓ pt-BR/{case_file.name} - answers shuffled')
        except Exception as e:
            errors.append(f'pt-BR/{case_file.name}: {str(e)}')
            print(f'✗ pt-BR/{case_file.name} - {str(e)}')

# Print summary
print(f'\n📊 Results: {processed} files processed')
if errors:
    print(f'⚠️  {len(errors)} errors:')
    for error in errors:
        print(f'  - {error}')
else:
    print('✅ All answers randomized successfully!')
