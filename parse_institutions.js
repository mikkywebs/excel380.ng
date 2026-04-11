const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\0d5a44e4-c494-4d74-9107-652bde5ab4fb\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.error("Log file not found:", logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find the section that contains the list
const startIndex = content.lastIndexOf('JOINT ADMISSIONS AND MATRICULATION BOARD');
if (startIndex === -1) {
  console.error("Could not find start index");
  process.exit(1);
}

const endIndex = content.indexOf('ensure all schools are captured alongside their cut off marks.', startIndex);
if (endIndex === -1) {
  console.error("Could not find end index");
  process.exit(1);
}

const tableText = content.substring(startIndex, endIndex);

let currentCategory = "Degree-Awarding Institutions";
const results = [];

const lines = tableText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Simple state machine
let currentEntry = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('COLLEGES OF EDUCATION')) {
    currentCategory = "Colleges of Education";
    continue;
  } else if (line.includes('POLYTECHNICS/MONOTECHNICS')) {
    currentCategory = "Polytechnics";
    continue;
  } else if (line.includes('Innovation Enterprise Institutions')) {
    currentCategory = "Innovation Enterprise Institutions";
    continue;
  }

  // Look for a line starting with number and dot
  const match = line.match(/^(\d+)\.\s+(.*)/);
  if (match) {
    // If we have a pending entry, we just push it
    if (currentEntry) {
      results.push(currentEntry);
    }
    
    currentEntry = {
      id: parseInt(match[1]),
      name: match[2].trim(),
      score: 0,
      category: currentCategory
    };
    
    // Check if score is at the end of this line
    const scoreMatch = currentEntry.name.match(/\s+(\d{3})$/);
    if (scoreMatch) {
        currentEntry.score = parseInt(scoreMatch[1]);
        currentEntry.name = currentEntry.name.replace(/\s+\d{3}$/, '').trim();
    }
  } else if (currentEntry && !isNaN(parseInt(line.trim())) && line.trim().length === 3) {
      // Line is just the score
      currentEntry.score = parseInt(line.trim());
  } else if (currentEntry && currentEntry.score === 0 && !line.includes('S/N Name of Institution') && !line.includes('Score')) {
      // Continuation of name
      currentEntry.name += ' ' + line.trim();
      
      const scoreMatch = currentEntry.name.match(/\s+(\d{3})$/);
      if (scoreMatch) {
          currentEntry.score = parseInt(scoreMatch[1]);
          currentEntry.name = currentEntry.name.replace(/\s+\d{3}$/, '').trim();
      }
  }
}

if (currentEntry && currentEntry.score > 0) {
  results.push(currentEntry);
}

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'institutions.json'), JSON.stringify(results, null, 2));
console.log(`Parsed ${results.length} institutions successfully!`);
