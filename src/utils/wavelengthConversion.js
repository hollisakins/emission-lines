/**
 * Convert vacuum wavelength to air wavelength
 * Formula: λ_air = λ_vac / n
 * where n = 1.0 + 2.735182E-4 + 131.4182 / λ_vac^2 + 2.76249E8 / λ_vac^4
 *
 * @param {number} lambdaVac - Vacuum wavelength in Angstroms
 * @returns {number} Air wavelength in Angstroms
 */
export function vacuumToAir(lambdaVac) {
  const n = 1.0 + 2.735182e-4 + 131.4182 / (lambdaVac ** 2) + 2.76249e8 / (lambdaVac ** 4);
  return lambdaVac / n;
}

/**
 * Convert air wavelength to vacuum wavelength
 * This is the inverse of vacuumToAir, solved iteratively
 *
 * @param {number} lambdaAir - Air wavelength in Angstroms
 * @returns {number} Vacuum wavelength in Angstroms
 */
export function airToVacuum(lambdaAir) {
  // Start with air wavelength as initial guess
  let lambdaVac = lambdaAir;

  // Iterate to find the vacuum wavelength
  for (let i = 0; i < 10; i++) {
    const n = 1.0 + 2.735182e-4 + 131.4182 / (lambdaVac ** 2) + 2.76249e8 / (lambdaVac ** 4);
    lambdaVac = lambdaAir * n;
  }

  return lambdaVac;
}

/**
 * Get the displayed wavelength based on display mode
 *
 * @param {Object} line - Emission line object
 * @param {boolean} showVacuum - Whether to show vacuum wavelengths
 * @returns {number} The wavelength to display
 */
export function getDisplayWavelength(line, showVacuum) {
  const { wavelength, isVacuum } = line;

  if (showVacuum) {
    // User wants vacuum wavelengths
    if (isVacuum) {
      // Already in vacuum (λ < 2000Å)
      return wavelength;
    } else {
      // Convert from air to vacuum (λ > 2000Å)
      return airToVacuum(wavelength);
    }
  } else {
    // User wants air wavelengths
    if (isVacuum) {
      // Convert from vacuum to air (λ < 2000Å)
      return vacuumToAir(wavelength);
    } else {
      // Already in air (λ > 2000Å)
      return wavelength;
    }
  }
}

/**
 * Format wavelength for display
 *
 * @param {number} wavelength - Wavelength in Angstroms
 * @param {number} decimals - Number of decimal places (default 3)
 * @returns {string} Formatted wavelength string
 */
export function formatWavelength(wavelength, decimals = 3) {
  return wavelength.toFixed(decimals);
}
