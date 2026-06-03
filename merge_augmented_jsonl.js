const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'output', 'augmented_jsonl');
const outputFile = path.join(__dirname, 'output', 'merged_augmented.jsonl');

// Get all .json files in the input directory
const files = fs.readdirSync(inputDir)
  .filter(file => file.endsWith('.json'))
  .sort(); // Optional: sort for deterministic order

const writeStream = fs.createWriteStream(outputFile, { flags: 'w' });

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const obj = JSON.parse(content);
    writeStream.write(JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e);
  }
});

writeStream.end();

console.log(`Merged ${files.length} files into ${outputFile} (one JSON object per line)`); 