import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENT_TYPES = new Set([
  'client',
  'cdn',
  'loadBalancer',
  'api',
  'cache',
  'database',
  'blobStorage',
  'queue',
  'worker',
]);

const ROOT = 'src/data/builder';

function readChallenges(locale) {
  const dir = locale === 'en' ? ROOT : join(ROOT, locale);
  const files = readdirSync(dir)
    .filter((file) => /^challenges-\d\d\.json$/.test(file))
    .sort();

  return files.map((file) => {
    const fullPath = join(dir, file);
    const payload = JSON.parse(readFileSync(fullPath, 'utf-8'));
    return { file, fullPath, payload };
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateChallenge(entry, locale) {
  const { file, payload } = entry;
  const numberFromFile = Number(file.match(/(\d\d)/)?.[1]);

  assert(Number.isInteger(numberFromFile), `[${locale}] ${file}: invalid file number format`);
  assert(payload.number === numberFromFile, `[${locale}] ${file}: number mismatch (expected ${numberFromFile}, got ${payload.number})`);

  const expectedId = `builder-${String(numberFromFile).padStart(2, '0')}`;
  assert(payload.id === expectedId, `[${locale}] ${file}: id mismatch (expected ${expectedId}, got ${payload.id})`);

  assert(typeof payload.title === 'string' && payload.title.length > 0, `[${locale}] ${file}: missing title`);
  assert(typeof payload.subtitle === 'string' && payload.subtitle.length > 0, `[${locale}] ${file}: missing subtitle`);
  assert(typeof payload.objective === 'string' && payload.objective.length > 0, `[${locale}] ${file}: missing objective`);

  assert(Array.isArray(payload.constraints) && payload.constraints.length >= 3, `[${locale}] ${file}: constraints must have at least 3 items`);
  assert(Array.isArray(payload.availableComponents) && payload.availableComponents.length >= 4, `[${locale}] ${file}: availableComponents must have at least 4 items`);

  for (const component of payload.availableComponents) {
    assert(COMPONENT_TYPES.has(component), `[${locale}] ${file}: unknown component '${component}' in availableComponents`);
  }

  assert(Array.isArray(payload.concepts) && payload.concepts.length >= 3, `[${locale}] ${file}: concepts must have at least 3 items`);

  for (const concept of payload.concepts) {
    assert(typeof concept.id === 'string' && concept.id.length > 0, `[${locale}] ${file}: concept missing id`);
    assert(typeof concept.title === 'string' && concept.title.length > 0, `[${locale}] ${file}: concept missing title`);
    assert(typeof concept.description === 'string' && concept.description.length > 0, `[${locale}] ${file}: concept missing description`);

    const hasRequiredAll = Array.isArray(concept.requiredAll) && concept.requiredAll.length > 0;
    const hasRequiredAny = Array.isArray(concept.requiredAnyOf) && concept.requiredAnyOf.length > 0;
    assert(hasRequiredAll || hasRequiredAny, `[${locale}] ${file}: concept '${concept.id}' must define requiredAll or requiredAnyOf`);

    for (const key of ['requiredAll', 'requiredAnyOf', 'discouragedComponents']) {
      if (!Array.isArray(concept[key])) continue;
      for (const component of concept[key]) {
        assert(COMPONENT_TYPES.has(component), `[${locale}] ${file}: concept '${concept.id}' has unknown component '${component}' in ${key}`);
      }
    }

    if (Array.isArray(concept.preferredConnections)) {
      for (const connection of concept.preferredConnections) {
        assert(
          COMPONENT_TYPES.has(connection.from) && COMPONENT_TYPES.has(connection.to),
          `[${locale}] ${file}: concept '${concept.id}' has invalid preferred connection ${connection.from} -> ${connection.to}`,
        );
      }
    }
  }
}

function validateParity(challengesEn, challengesPtBR) {
  assert(challengesEn.length === challengesPtBR.length, `Locale mismatch: en has ${challengesEn.length}, pt-BR has ${challengesPtBR.length}`);

  for (let i = 0; i < challengesEn.length; i += 1) {
    const en = challengesEn[i].payload;
    const pt = challengesPtBR[i].payload;

    assert(en.id === pt.id, `Locale mismatch at index ${i}: id ${en.id} != ${pt.id}`);
    assert(en.number === pt.number, `Locale mismatch for ${en.id}: number ${en.number} != ${pt.number}`);
    assert(en.availableComponents.join(',') === pt.availableComponents.join(','), `Locale mismatch for ${en.id}: availableComponents differ`);
    assert(en.concepts.length === pt.concepts.length, `Locale mismatch for ${en.id}: concept count differs`);

    for (let j = 0; j < en.concepts.length; j += 1) {
      assert(en.concepts[j].id === pt.concepts[j].id, `Locale mismatch for ${en.id}: concept id differs at position ${j}`);
    }
  }
}

function main() {
  const challengesEn = readChallenges('en');
  const challengesPtBR = readChallenges('pt-BR');

  for (const entry of challengesEn) validateChallenge(entry, 'en');
  for (const entry of challengesPtBR) validateChallenge(entry, 'pt-BR');

  validateParity(challengesEn, challengesPtBR);

  console.log(`Builder challenge validation passed for ${challengesEn.length} challenge pairs.`);
}

main();
