/**
 * API Configuration
 */
export const API_CONFIG = {
  JOLPICA_BASE_URL: 'https://api.jolpi.ca/ergast/f1',
  OPENF1_BASE_URL: 'https://api.openf1.org/v1',
  REQUEST_DELAY_MS: 150,
} as const;

/**
 * F1 Points System
 */
export const F1_POINTS = {
  MAX_RACE_POINTS: 25, // Maximum points for a race win
  MAX_SPRINT_POINTS: 8, // Maximum points for a sprint race win
} as const;

/**
 * Chart Configuration
 */
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 350,
  MOBILE_HEIGHT: 300,
  DEFAULT_COLOR: '#667eea',
  SPINNER_DIAMETER: 60,
} as const;

/**
 * Nationality to ISO 3166-1 alpha-2 country code mapping
 * Used for flag emoji display
 */
export const NATIONALITY_TO_CODE: Record<string, string> = {
  American: 'US',
  Argentine: 'AR',
  Australian: 'AU',
  Austrian: 'AT',
  Belgian: 'BE',
  Brazilian: 'BR',
  British: 'GB',
  Canadian: 'CA',
  Chinese: 'CN',
  Colombian: 'CO',
  Czech: 'CZ',
  Danish: 'DK',
  Dutch: 'NL',
  Finnish: 'FI',
  French: 'FR',
  German: 'DE',
  Hungarian: 'HU',
  Indian: 'IN',
  Irish: 'IE',
  Italian: 'IT',
  Japanese: 'JP',
  Malaysian: 'MY',
  Mexican: 'MX',
  Monegasque: 'MC',
  'New Zealander': 'NZ',
  Polish: 'PL',
  Portuguese: 'PT',
  Russian: 'RU',
  Spanish: 'ES',
  Swedish: 'SE',
  Swiss: 'CH',
  Thai: 'TH',
  Venezuelan: 'VE',
} as const;
