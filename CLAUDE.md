# Emission Lines Browser

A React-based web app for browsing and filtering UV/optical emission lines observed in galaxies, AGN, and QSOs.

**Live site:** https://hollisakins.github.io/emission-lines/

## Overview

This app displays ~234 emission lines (700–11,000 Å) in a sortable, filterable table. The data was parsed from [Drew Chojnowski's Table of Emission Lines](http://astronomy.nmsu.edu/drewski/tableofemissionlines.html), with atomic data from NIST.

## Tech Stack

- **React** with Vite
- **No backend** - all client-side, static JSON data
- **GitHub Pages** for hosting

## Key Features

1. **Sortable table** - Click column headers (λ, Ion, Type, IP) to sort ascending/descending
2. **Vacuum/Air wavelength toggle** - Defaults to vacuum; converts using the formula:
   ```
   λ_air = λ_vac / (1.0 + 2.735182E-4 + 131.4182/λ_vac² + 2.76249E8/λ_vac⁴)
   ```
   - Lines with λ < 2000Å are stored as vacuum wavelengths
   - Lines with λ > 2000Å are stored as air wavelengths
   - Asterisk (*) marks converted values
3. **Search with Greek letter aliases** - Type "Ha" to find Hα, "Lyb" for Lyβ, etc.
4. **Wavelength range filter** - Min/max inputs
5. **Common lines highlighting** - Hα, Hβ, [O III], etc. highlighted in amber
6. **"Common lines only" checkbox**

## File Structure

```
emlines/
├── scripts/
│   └── parseEmissionLines.js   # Node script to parse source HTML into JSON
├── src/
│   ├── components/
│   │   └── EmissionLinesTable.jsx   # Main table with sorting/filtering
│   ├── data/
│   │   └── emissionLines.json       # 234 emission lines
│   ├── utils/
│   │   └── wavelengthConversion.js  # Vacuum↔air conversion functions
│   ├── App.jsx                      # Main app component
│   ├── App.css                      # All styles (light mode only)
│   └── index.css                    # Minimal reset
├── package.json
└── vite.config.js                   # Base path set to /emission-lines/
```

## Data Format

Each emission line in `emissionLines.json` has:
```json
{
  "id": 1,
  "wavelength": 770.409,
  "isVacuum": true,
  "ion": "Ne VIII",
  "energyInitial": 0.0,
  "energyFinal": 16.093,
  "configurations": "1s²2s - 1s²2p",
  "terms": "²S - ²P⁰",
  "jTransition": "1/2 - 3/2",
  "transitionType": "E1",
  "ionizationPotential": 207.27,
  "references": "Z97",
  "note": ""
}
```

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Updating the Data

If you need to re-parse the source data:

1. Download the HTML: `curl -k "http://astronomy.nmsu.edu/drewski/tableofemissionlines.html" > /tmp/emission_lines.html`
2. Run the parser: `node scripts/parseEmissionLines.js`
3. The script writes to `src/data/emissionLines.json`

## Design Decisions

- **Light mode only** - Dark mode was removed for simplicity
- **Greek letter search** - Aliases defined in `EmissionLinesTable.jsx` (`GREEK_ALIASES` object)
- **Common lines** - Defined in `COMMON_LINES` array in `EmissionLinesTable.jsx`
- **Default to vacuum wavelengths** - Set in `App.jsx` (`useState(true)`)
