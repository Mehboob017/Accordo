export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

/**
 * Normalizes and matches any raw state string (e.g. from Google Places, manual entry, or backend)
 * to the canonical state name in INDIAN_STATES.
 *
 * @param {string} stateName - The state string (e.g. from address_components)
 * @param {string} [fullAddress] - Optional full address string as fallback
 * @returns {string} The matched canonical state name, or empty string if no match.
 */
export const findMatchingState = (stateName, fullAddress = '') => {
  if (stateName && typeof stateName === 'string') {
    const trimmed = stateName.trim();
    const lower = trimmed.toLowerCase();

    // 1. Direct case-insensitive match
    const exactMatch = INDIAN_STATES.find((s) => s.toLowerCase() === lower);
    if (exactMatch) return exactMatch;

    // 2. Common aliases & variations returned by Google Places
    const aliases = {
      'delhi': 'Delhi',
      'new delhi': 'Delhi',
      'nct of delhi': 'Delhi',
      'national capital territory of delhi': 'Delhi',
      'orissa': 'Odisha',
      'uttaranchal': 'Uttarakhand',
      'pondicherry': 'Puducherry',
      'jammu & kashmir': 'Jammu and Kashmir',
      'j&k': 'Jammu and Kashmir',
      'andaman & nicobar': 'Andaman and Nicobar Islands',
      'andaman and nicobar': 'Andaman and Nicobar Islands',
      'andaman & nicobar islands': 'Andaman and Nicobar Islands',
      'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
      'dadra & nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
      'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
      'daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
      'dnh & dd': 'Dadra and Nagar Haveli and Daman and Diu',
    };

    if (aliases[lower]) {
      return aliases[lower];
    }

    // 3. Substring match (e.g., "State of Maharashtra", "West Bengal State")
    const partialMatch = INDIAN_STATES.find(
      (s) => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower)
    );
    if (partialMatch) return partialMatch;
  }

  // 4. Fallback: search in full address string if provided
  if (fullAddress && typeof fullAddress === 'string') {
    const fullLower = fullAddress.toLowerCase();
    // Sort states by length descending so multi-word states match first
    const sortedStates = [...INDIAN_STATES].sort((a, b) => b.length - a.length);
    const foundInFull = sortedStates.find((s) => {
      const sLower = s.toLowerCase();
      const regex = new RegExp(`\\b${sLower}\\b`, 'i');
      return regex.test(fullLower);
    });
    if (foundInFull) return foundInFull;
  }

  return '';
};
