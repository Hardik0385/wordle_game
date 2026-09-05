const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function updateDict() {
  try {
    console.log('Fetching Wordle answers...');
    const answersText = await fetchFile('https://raw.githubusercontent.com/Kinkelin/WordleCompetition/main/data/official/shuffled_real_wordles.txt');
    
    console.log('Fetching allowed guesses...');
    const allowedText = await fetchFile('https://raw.githubusercontent.com/Kinkelin/WordleCompetition/main/data/official/official_allowed_guesses.txt');

    const parseWords = (text) => text.split('\n')
                                     .map(w => w.trim().toUpperCase())
                                     .filter(w => w.length === 5);

    const answers = parseWords(answersText);
    const allowed = parseWords(allowedText);

    // Some answers might not be in the allowed list, but for Wordle both sets should be considered valid guesses
    // In our validator, a guess is valid if it's in `answers` OR `allowed`.

    // Also inject some common missing words just in case
    if (!allowed.includes('TREES') && !answers.includes('TREES')) allowed.push('TREES');

    const dict = { answers, allowed };

    const outputPath = path.join(__dirname, '../src/data/words/5.json');
    fs.writeFileSync(outputPath, JSON.stringify(dict, null, 2));

    console.log(`Successfully updated dictionary! Answers: ${answers.length}, Allowed: ${allowed.length}`);
  } catch (err) {
    console.error('Failed to update dictionary:', err);
  }
}

updateDict();
