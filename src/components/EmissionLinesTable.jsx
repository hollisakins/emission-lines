import { useState, useMemo } from 'react';
import { getDisplayWavelength, formatWavelength } from '../utils/wavelengthConversion';

// Common emission lines to highlight
const COMMON_LINES = [
  'Hα', 'Hβ', 'Hγ', 'Hδ', 'Lyα', 'Lyβ',
  '[O III]', '[O II]', '[O I]',
  '[N II]', '[N I]',
  '[S II]', '[S III]',
  '[Ne III]', '[Ne V]',
  'He I', 'He II',
  'C IV', 'C III]', 'C II]',
  'Mg II', 'Ca II',
  '[Fe VII]', '[Fe X]', '[Fe XIV]'
];

function isCommonLine(ion) {
  return COMMON_LINES.some(common =>
    ion.includes(common) || ion === common.replace(/[\[\]]/g, '')
  );
}

// Greek letter aliases for search (roman -> greek)
const GREEK_ALIASES = {
  'a': 'α', 'alpha': 'α',
  'b': 'β', 'beta': 'β',
  'g': 'γ', 'gamma': 'γ',
  'd': 'δ', 'delta': 'δ',
  'e': 'ε', 'epsilon': 'ε',
  'z': 'ζ', 'zeta': 'ζ',
  'h': 'η', 'eta': 'η',
};

// Expand search term to include Greek letter variants
function expandSearchTerm(term) {
  const lowerTerm = term.toLowerCase();
  const variants = [lowerTerm];

  // Check for patterns like "Ha", "Hb", "Lya", "Lyb", etc.
  for (const [roman, greek] of Object.entries(GREEK_ALIASES)) {
    // Match end of string (e.g., "ha" -> "hα", "lya" -> "lyα")
    if (lowerTerm.endsWith(roman)) {
      const prefix = lowerTerm.slice(0, -roman.length);
      variants.push(prefix + greek);
    }
  }

  return variants;
}

export default function EmissionLinesTable({ data, showVacuum }) {
  const [sortConfig, setSortConfig] = useState({ key: 'wavelength', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [wavelengthMin, setWavelengthMin] = useState('');
  const [wavelengthMax, setWavelengthMax] = useState('');
  const [showCommonOnly, setShowCommonOnly] = useState(false);

  // Process and sort data
  const processedData = useMemo(() => {
    let filtered = data.map(line => ({
      ...line,
      displayWavelength: getDisplayWavelength(line, showVacuum),
      isCommon: isCommonLine(line.ion)
    }));

    // Apply search filter with Greek letter expansion
    if (searchTerm) {
      const searchVariants = expandSearchTerm(searchTerm);
      filtered = filtered.filter(line => {
        const ionLower = line.ion.toLowerCase();
        const configLower = line.configurations.toLowerCase();
        const refsLower = line.references.toLowerCase();
        return searchVariants.some(variant =>
          ionLower.includes(variant) ||
          configLower.includes(variant) ||
          refsLower.includes(variant)
        );
      });
    }

    // Apply wavelength range filter
    if (wavelengthMin) {
      const min = parseFloat(wavelengthMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(line => line.displayWavelength >= min);
      }
    }
    if (wavelengthMax) {
      const max = parseFloat(wavelengthMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(line => line.displayWavelength <= max);
      }
    }

    // Filter common lines only
    if (showCommonOnly) {
      filtered = filtered.filter(line => line.isCommon);
    }

    // Sort data
    filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'wavelength') {
        aVal = a.displayWavelength;
        bVal = b.displayWavelength;
      } else if (sortConfig.key === 'ionizationPotential') {
        aVal = a.ionizationPotential || 0;
        bVal = b.ionizationPotential || 0;
      } else {
        aVal = a[sortConfig.key] || '';
        bVal = b[sortConfig.key] || '';
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, showVacuum, sortConfig, searchTerm, wavelengthMin, wavelengthMax, showCommonOnly]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setWavelengthMin('');
    setWavelengthMax('');
    setShowCommonOnly(false);
  };

  return (
    <div className="table-container">
      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search ion/config:</label>
            <input
              id="search"
              type="text"
              placeholder="e.g., [O III], Fe, Ha, Lyb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="wl-min">λ min (Å):</label>
            <input
              id="wl-min"
              type="number"
              placeholder="700"
              value={wavelengthMin}
              onChange={(e) => setWavelengthMin(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="wl-max">λ max (Å):</label>
            <input
              id="wl-max"
              type="number"
              placeholder="11000"
              value={wavelengthMax}
              onChange={(e) => setWavelengthMax(e.target.value)}
            />
          </div>
          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={showCommonOnly}
                onChange={(e) => setShowCommonOnly(e.target.checked)}
              />
              Common lines only
            </label>
          </div>
          <button className="clear-btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
        <div className="results-count">
          Showing {processedData.length} of {data.length} lines
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('wavelength')} className="sortable">
                λ ({showVacuum ? 'vac' : 'air'}) Å{getSortIndicator('wavelength')}
              </th>
              <th onClick={() => handleSort('ion')} className="sortable">
                Ion{getSortIndicator('ion')}
              </th>
              <th>E<sub>i</sub> (eV)</th>
              <th>E<sub>k</sub> (eV)</th>
              <th>Configurations</th>
              <th>Terms</th>
              <th>J<sub>i</sub> - J<sub>k</sub></th>
              <th onClick={() => handleSort('transitionType')} className="sortable">
                Type{getSortIndicator('transitionType')}
              </th>
              <th onClick={() => handleSort('ionizationPotential')} className="sortable">
                IP (eV){getSortIndicator('ionizationPotential')}
              </th>
              <th>Refs</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((line) => (
              <tr
                key={line.id}
                className={line.isCommon ? 'common-line' : ''}
              >
                <td className="wavelength">
                  {formatWavelength(line.displayWavelength)}
                  {line.isVacuum !== showVacuum && (
                    <span className="converted" title="Converted from original">*</span>
                  )}
                </td>
                <td className="ion">{line.ion}</td>
                <td className="numeric">{line.energyInitial?.toFixed(3) || '—'}</td>
                <td className="numeric">{line.energyFinal?.toFixed(3) || '—'}</td>
                <td className="config">{line.configurations}</td>
                <td className="terms">{line.terms}</td>
                <td className="j-transition">{line.jTransition}</td>
                <td className="type">{line.transitionType}</td>
                <td className="numeric">{line.ionizationPotential?.toFixed(2) || '—'}</td>
                <td className="refs">{line.references}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {processedData.length === 0 && (
        <div className="no-results">
          No emission lines match your filters.
        </div>
      )}
    </div>
  );
}
