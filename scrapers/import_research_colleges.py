"""Import the supplied Nepal College Research Pack into the college review queue.

Dry-run is the default. The importer intentionally creates ``pending_review``
records: the pack contains primary-source research, but it explicitly marks
fees, founding years, admissions and some affiliations as dynamic.

Examples:
  python scrapers/import_research_colleges.py /path/Nepal_College_Database_50_Research_Pack.json
  python scrapers/import_research_colleges.py /path/pack.json --commit
"""
from __future__ import annotations

import argparse, json, os, re, sys
from pathlib import Path
from typing import Any
try:
    from dotenv import load_dotenv
    load_dotenv()
except ModuleNotFoundError:
    pass
LEVELS = {'+2': 'plus_two', 'bachelor': 'bachelor', 'master': 'master', 'mphil': 'mphil', 'phd': 'phd', 'diploma': 'diploma', 'certificate': 'certificate'}

def slugify(value: str) -> str:
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-'))[:180]

def levels(programs: list[str]) -> list[str]:
    text = ' '.join(programs).lower(); found: set[str] = set()
    if '+2' in text or 'a level' in text or 'higher secondary' in text: found.add('plus_two')
    if re.search(r'\b(bba|bca|bsc|bbs|bbm|bim|be|btech|bpharm|mbbs|bachelor|b\.sc|b\.a)\b', text): found.add('bachelor')
    if re.search(r'\b(mba|mbs|msc|ma |med |master|m\.sc)\b', text): found.add('master')
    if 'mphil' in text: found.add('mphil')
    if 'phd' in text: found.add('phd')
    return sorted(found)

def record(item: dict[str, Any]) -> dict[str, Any]:
    sources = [str(url) for url in item.get('sources', []) if str(url).startswith(('http://', 'https://'))]
    website = str(item.get('website') or (sources[0] if sources else '')).strip()
    location = str(item.get('location') or item.get('region') or 'Nepal').strip()
    parts = [item.get('usp'), item.get('student_fit'), item.get('career')]
    description = '\n\n'.join(str(part).strip() for part in parts if part and not str(part).startswith('DYNAMIC'))
    facilities = [x.strip() for x in re.split(r',|;|\band\b', str(item.get('facilities') or ''), flags=re.I) if x.strip()]
    return {
        'name': str(item['name']).strip(), 'slug': slugify(str(item.get('slug') or item['name'])),
        'location': location, 'address': location, 'affiliation': str(item.get('affiliation') or item.get('type') or '').strip() or None,
        'description': description or None, 'website': website or None, 'education_levels': levels([str(x) for x in item.get('programs', [])]),
        'facilities': facilities[:30], 'status': 'pending_review', 'verification_status': 'unverified',
        'source_name': 'Nepal College Research Pack (primary-source review)', 'source_url': website or (sources[0] if sources else None),
        'last_verified_at': None, 'is_featured': False,
    }

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__); parser.add_argument('file', type=Path); parser.add_argument('--commit', action='store_true'); args = parser.parse_args()
    payload = json.loads(args.file.read_text(encoding='utf-8')); items = payload.get('colleges') if isinstance(payload, dict) else None
    if not isinstance(items, list) or not items: print('Expected a JSON object with a colleges array.', file=sys.stderr); return 1
    rows = [record(item) for item in items]; print(f'Validated {len(rows)} college records from {args.file}')
    for row in rows: print(f"  {row['slug']}: {row['name']} [{', '.join(row['education_levels']) or 'level review needed'}]")
    if not args.commit: print('\nDry-run only. Re-run with --commit after applying the discovery migration.'); return 0
    url, key = os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key: print('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --commit.', file=sys.stderr); return 2
    try:
        from supabase import create_client
    except ModuleNotFoundError:
        print('supabase-py is required for --commit. Run: pip install -r scrapers/requirements.txt', file=sys.stderr); return 2
    db = create_client(url, key); inserted = skipped = 0
    for row in rows:
        existing = db.table('colleges').select('id').or_(f"slug.eq.{row['slug']},name.ilike.{row['name']}").limit(1).execute()
        if existing.data: skipped += 1; continue
        db.table('colleges').insert(row).execute(); inserted += 1
    print(f'Imported {inserted}; skipped {skipped} existing records. All new rows remain pending_review.')
    return 0

if __name__ == '__main__': raise SystemExit(main())
