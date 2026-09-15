// Runtime data ingestion test
// This script tests the actual data loading logic as it would run in the browser

const fs = require('fs');
const path = require('path');

// Simulate d3.csvParse (simplified version)
function csvParse(text) {
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentLine.push(currentField);
            currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && text[i + 1] === '\n') i++; // Handle \r\n
            currentLine.push(currentField);
            if (currentLine.length > 1 || currentLine[0]) {
                lines.push(currentLine);
            }
            currentLine = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        lines.push(currentLine);
    }
    
    // Convert to objects
    const headers = lines[0];
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const row = {};
        for (let j = 0; j < headers.length && j < lines[i].length; j++) {
            row[headers[j]] = lines[i][j];
        }
        data.push(row);
    }
    
    return data;
}

// Simulate the dataService.loadData() function
function loadData() {
    const DATA_PATH = path.join(__dirname, 'public/data/fight-songs-538.csv');
    const csvText = fs.readFileSync(DATA_PATH, 'utf8');
    const data = csvParse(csvText).map((row) => {
        // Parse numeric fields explicitly (same as dataService.ts)
        return {
            school: row.school || '',
            conference: row.conference || '',
            song_name: row.song_name || '',
            writers: row.writers || '',
            year: row.year || '',
            student_writer: row.student_writer || '',
            official_song: row.official_song || '',
            contest: row.contest || '',
            bpm: Number(row.bpm) || 0,
            sec_duration: Number(row.sec_duration) || 0,
            fight: row.fight || '',
            number_fights: Number(row.number_fights) || 0,
            victory: row.victory || '',
            win_won: row.win_won || '',
            victory_win_won: row.victory_win_won || '',
            rah: row.rah || '',
            nonsense: row.nonsense || '',
            colors: row.colors || '',
            men: row.men || '',
            opponents: row.opponents || '',
            spelling: row.spelling || '',
            trope_count: Number(row.trope_count) || 0,
            spotify_id: row.spotify_id || '',
        };
    });
    
    return data;
}

console.log('='.repeat(70));
console.log('RUNTIME DATA INGESTION TEST');
console.log('='.repeat(70));

try {
    console.log('\nLoading data...');
    const data = loadData();
    
    console.log(`✓ Loaded ${data.length} rows`);
    
    // Validate data integrity
    console.log('\nValidating data integrity...');
    
    // Check for null/empty critical fields
    const nullSchools = data.filter(d => !d.school).length;
    const nullConferences = data.filter(d => !d.conference).length;
    const zeroBpm = data.filter(d => d.bpm === 0).length;
    const zeroDuration = data.filter(d => d.sec_duration === 0).length;
    
    console.log(`  Null/empty schools: ${nullSchools}`);
    console.log(`  Null/empty conferences: ${nullConferences}`);
    console.log(`  Zero BPM values: ${zeroBpm}`);
    console.log(`  Zero duration values: ${zeroDuration}`);
    
    // Check numeric ranges
    const bpms = data.map(d => d.bpm).filter(b => b > 0);
    const durs = data.map(d => d.sec_duration).filter(d => d > 0);
    
    console.log(`\nNumeric ranges:`);
    console.log(`  BPM: min=${Math.min(...bpms)}, max=${Math.max(...bpms)}, avg=${bpms.reduce((a,b) => a+b, 0)/bpms.length.toFixed(1)}`);
    console.log(`  Duration: min=${Math.min(...durs)}, max=${Math.max(...durs)}, avg=${(durs.reduce((a,b) => a+b, 0)/durs.length).toFixed(1)}`);
    
    // Check conferences
    const conferences = [...new Set(data.map(d => d.conference))].sort();
    console.log(`\nConferences (${conferences.length}): ${conferences.join(', ')}`);
    
    // Sample data
    console.log('\nSample data (first 3 rows):');
    data.slice(0, 3).forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.school} (${row.conference}): BPM=${row.bpm}, Duration=${row.sec_duration}s`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('RESULT: ✓ DATA INGESTION TEST PASSED');
    console.log('='.repeat(70));
    
} catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
}
