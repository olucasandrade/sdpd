#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function processCase(caseData) {
  // Shuffle root cause options
  if (caseData.diagnosis && caseData.diagnosis.rootCause && caseData.diagnosis.rootCause.options) {
    caseData.diagnosis.rootCause.options = shuffleArray(caseData.diagnosis.rootCause.options);
  }

  // Shuffle fix options
  if (caseData.diagnosis && caseData.diagnosis.fix && caseData.diagnosis.fix.options) {
    caseData.diagnosis.fix.options = shuffleArray(caseData.diagnosis.fix.options);
  }

  return caseData;
}

// Process all case files
const casesDir = path.join(__dirname, '../src/data/cases');
const files = fs.readdirSync(casesDir).filter(f => f.match(/^case-\d+\.json$/));

let processed = 0;
let errors = [];

files.forEach(file => {
  const filePath = path.join(casesDir, file);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const caseData = JSON.parse(content);

    const shuffled = processCase(caseData);

    fs.writeFileSync(filePath, JSON.stringify(shuffled, null, 2));
    processed++;
    console.log(`✓ ${file} - answers shuffled`);
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    console.error(`✗ ${file} - ${error.message}`);
  }
});

// Also process Portuguese versions
const ptBrDir = path.join(casesDir, 'pt-BR');
if (fs.existsSync(ptBrDir)) {
  const ptFiles = fs.readdirSync(ptBrDir).filter(f => f.match(/^case-\d+\.json$/));

  ptFiles.forEach(file => {
    const filePath = path.join(ptBrDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const caseData = JSON.parse(content);

      const shuffled = processCase(caseData);

      fs.writeFileSync(filePath, JSON.stringify(shuffled, null, 2));
      processed++;
      console.log(`✓ pt-BR/${file} - answers shuffled`);
    } catch (error) {
      errors.push(`pt-BR/${file}: ${error.message}`);
      console.error(`✗ pt-BR/${file} - ${error.message}`);
    }
  });
}

console.log(`\n📊 Results: ${processed} files processed`);
if (errors.length > 0) {
  console.log(`⚠️  ${errors.length} errors:`);
  errors.forEach(err => console.log(`  - ${err}`));
  process.exit(1);
} else {
  console.log('✅ All answers randomized successfully!');
  process.exit(0);
}
