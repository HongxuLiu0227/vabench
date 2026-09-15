// Test script to verify CSV parsing
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'public/data/TableauTemp_06jfdtn1lakc5a1amq8mn12idbt8.csv');
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);
console.log('\nFirst line:');
console.log(repr(lines[0]));
console.log('\nFirst 10 lines:');
lines.slice(0, 10).forEach((line, i) => {
  console.log(`${i + 1}: ${line.substring(0, 100)}`);
});

function repr(str) {
  return JSON.stringify(str);
}
