import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the HTML file
const html = fs.readFileSync('/tmp/emission_lines.html', 'utf8');
const $ = cheerio.load(html);

const emissionLines = [];

// Find the main table and iterate through rows
$('table tr').each((index, row) => {
  // Skip header row
  if (index === 0) return;

  const cells = $(row).find('td');
  if (cells.length < 10) return;

  // Extract text content, handling HTML entities and superscripts
  const getText = (cell) => {
    return $(cell).text().trim().replace(/\s+/g, ' ');
  };

  // Get the HTML content for configurations and terms (to preserve superscripts)
  const getHtml = (cell) => {
    return $(cell).html()?.trim() || '';
  };

  const wavelengthStr = getText(cells[0]);
  const wavelength = parseFloat(wavelengthStr);

  if (isNaN(wavelength)) return;

  const ion = getText(cells[1]);
  const energyInitial = parseFloat(getText(cells[2])) || null;
  const energyFinal = parseFloat(getText(cells[3])) || null;
  const configurations = getText(cells[4]);
  const terms = getText(cells[5]);
  const jTransition = getText(cells[6]);
  const transitionType = getText(cells[7]) || 'E1';
  const ionizationPotential = parseFloat(getText(cells[8])) || null;
  const references = getText(cells[9]);
  const note = getText(cells[10]) || '';

  // Clean up the ion name - handle HTML entities
  let cleanIon = ion
    .replace(/α/g, 'α')
    .replace(/β/g, 'β')
    .replace(/γ/g, 'γ')
    .replace(/δ/g, 'δ')
    .replace(/ε/g, 'ε');

  emissionLines.push({
    id: index,
    wavelength,
    wavelengthOriginal: wavelengthStr,
    isVacuum: wavelength < 2000,
    ion: cleanIon,
    energyInitial,
    energyFinal,
    configurations,
    terms,
    jTransition,
    transitionType: transitionType === '' || transitionType === ' ' ? 'E1' : transitionType,
    ionizationPotential,
    references,
    note
  });
});

// Sort by wavelength
emissionLines.sort((a, b) => a.wavelength - b.wavelength);

// Re-assign IDs after sorting
emissionLines.forEach((line, idx) => {
  line.id = idx + 1;
});

console.log(`Parsed ${emissionLines.length} emission lines`);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON file
const outputPath = path.join(outputDir, 'emissionLines.json');
fs.writeFileSync(outputPath, JSON.stringify(emissionLines, null, 2));
console.log(`Written to ${outputPath}`);

// Print some stats
const ions = [...new Set(emissionLines.map(l => l.ion))];
console.log(`\nUnique ions: ${ions.length}`);
console.log(`Wavelength range: ${emissionLines[0].wavelength} - ${emissionLines[emissionLines.length - 1].wavelength} Å`);

// Print first few entries for verification
console.log('\nFirst 5 entries:');
emissionLines.slice(0, 5).forEach(line => {
  console.log(`  ${line.wavelength} Å - ${line.ion}`);
});
