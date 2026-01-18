import { useState } from 'react';
import EmissionLinesTable from './components/EmissionLinesTable';
import emissionLinesData from './data/emissionLines.json';
import './App.css';

function App() {
  const [showVacuum, setShowVacuum] = useState(true);

  return (
    <div className="app">
      <header>
        <h1>UV/Optical Emission Lines in Galaxies</h1>
        <p className="subtitle">
          Emission lines from 700–11,000 Å observed in galaxies, AGN, and QSOs
        </p>
        <p className="source">
          Data from{' '}
          <a
            href="http://astronomy.nmsu.edu/drewski/tableofemissionlines.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Drew Chojnowski's Table of Emission Lines
          </a>
          {' '}• Atomic data from{' '}
          <a
            href="https://www.nist.gov/pml/atomic-spectra-database"
            target="_blank"
            rel="noopener noreferrer"
          >
            NIST ASD
          </a>
        </p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label className="toggle-label">
            <span className={!showVacuum ? 'active' : ''}>Air λ</span>
            <button
              className={`toggle-switch ${showVacuum ? 'on' : ''}`}
              onClick={() => setShowVacuum(!showVacuum)}
              aria-label="Toggle between vacuum and air wavelengths"
            >
              <span className="toggle-slider" />
            </button>
            <span className={showVacuum ? 'active' : ''}>Vacuum λ</span>
          </label>
          <span className="toggle-hint">
            {showVacuum
              ? 'Showing vacuum wavelengths (λ > 2000Å converted)'
              : 'Showing air wavelengths (λ < 2000Å converted)'}
          </span>
        </div>
      </div>

      <main>
        <EmissionLinesTable
          data={emissionLinesData}
          showVacuum={showVacuum}
        />
      </main>

      <footer>
        <p>
          <strong>Note:</strong> Vacuum wavelengths are given for λ &lt; 2000Å;
          air wavelengths for λ &gt; 2000Å. Asterisk (*) indicates converted values.
        </p>
        <p>
          Conversion formula: λ<sub>air</sub> = λ<sub>vac</sub> / (1.0 + 2.735182×10⁻⁴ +
          131.4182 / λ<sub>vac</sub>² + 2.76249×10⁸ / λ<sub>vac</sub>⁴)
        </p>
      </footer>
    </div>
  );
}

export default App;
