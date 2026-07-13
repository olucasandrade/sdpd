// Generates a lightweight case-index JSON (id, number, title, subtitle, conceptId)
// for each locale, read from src/data/cases/**/*.json. Consumed by useAllCases()
// so the Home page and Sidebar don't need to eagerly load full case bodies.
//
// Run automatically via "predev"/"prebuild" npm scripts.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesDir = path.join(__dirname, '..', 'src', 'data', 'cases');
const outDir = path.join(__dirname, '..', 'src', 'data');

function buildIndex(dir) {
  return readdirSync(dir)
    .filter((f) => f.startsWith('case-') && f.endsWith('.json'))
    .sort()
    .map((f) => {
      const full = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'));
      return {
        id: full.id,
        number: full.number,
        title: full.title,
        subtitle: full.subtitle,
        conceptId: full.conceptId,
      };
    });
}

const enIndex = buildIndex(casesDir);
const ptBrIndex = buildIndex(path.join(casesDir, 'pt-BR'));

writeFileSync(path.join(outDir, 'case-index.json'), JSON.stringify(enIndex, null, 2) + '\n');
writeFileSync(path.join(outDir, 'case-index.pt-BR.json'), JSON.stringify(ptBrIndex, null, 2) + '\n');

console.log(`Generated case-index.json (${enIndex.length} cases) and case-index.pt-BR.json (${ptBrIndex.length} cases)`);
