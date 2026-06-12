const PERCENT_RATE_FIELD_IDS = new Set([
  'PF_1_3',
  'PF_1_4_employer_contribution',
  'PF_1_4_employee_contribution',
  'PF_1_11',
  'PF_1_12',
  'PF_1_13',
]);

const INTEGER_FIELD_IDS = new Set([
  'PF_1_7',
  'PF_1_9_sub_times',
  'LE_3_3_days',
  'LE_3_3_percentage',
  'LE_3_5_days',
  'LE_3_7_basic_working_days',
  'LE_3_7_gross_working_days',
  'LE_3_8_maximum_carry_forward_days',
  'RA_4_1_years',
  'MP_6_3',
]);

export type SurveyInputKind = 'text' | 'percentRate' | 'integer';

export function resolveSurveyInputKind(
  fieldId: string,
  inputVariant?: 'rate' | 'integer'
): SurveyInputKind {
  if (inputVariant === 'rate' || PERCENT_RATE_FIELD_IDS.has(fieldId)) {
    return 'percentRate';
  }
  if (inputVariant === 'integer' || INTEGER_FIELD_IDS.has(fieldId)) {
    return 'integer';
  }
  return 'text';
}

export function sanitizePercentRate(raw: string): string {
  if (!raw) return '';

  let cleaned = raw.replace(/[^\d.]/g, '');
  const dotIndex = cleaned.indexOf('.');

  if (dotIndex !== -1) {
    const before = cleaned.slice(0, dotIndex);
    const after = cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2);
    cleaned = `${before}.${after}`;
  }

  if (cleaned === '.') return '0.';
  if (cleaned.startsWith('.')) cleaned = `0${cleaned}`;

  const num = parseFloat(cleaned);
  if (!isNaN(num)) {
    if (num > 100) return '100.00';
    if (num < 0) return '0';
  }

  return cleaned;
}

export function sanitizeInteger(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function sanitizeSurveyInput(
  raw: string,
  fieldId: string,
  inputVariant?: 'rate' | 'integer'
): string {
  const kind = resolveSurveyInputKind(fieldId, inputVariant);
  if (kind === 'percentRate') return sanitizePercentRate(raw);
  if (kind === 'integer') return sanitizeInteger(raw);
  return raw;
}

const PERCENT_HINT_EXAMPLES: Record<string, string> = {
  PF_1_3: '7.50',
  PF_1_4_employer_contribution: '5.00',
  PF_1_4_employee_contribution: '5.00',
  PF_1_11: '8.00',
  PF_1_12: '80.00',
  PF_1_13: '2',
};

const INTEGER_HINT_EXAMPLES: Record<string, string> = {
  PF_1_7: '30',
  PF_1_9_sub_times: '1',
  LE_3_3_days: '10',
  LE_3_3_percentage: '50',
  LE_3_5_days: '15',
  LE_3_7_basic_working_days: '26',
  LE_3_7_gross_working_days: '30',
  LE_3_8_maximum_carry_forward_days: '10',
  RA_4_1_years: '60',
  MP_6_3: '24',
};

export function percentRateHint(fieldId?: string): string {
  const example = fieldId ? PERCENT_HINT_EXAMPLES[fieldId] : undefined;
  if (example) return `Enter a percentage from 0.00 to 100.00 — example: ${example}`;
  return 'Enter a percentage from 0.00 to 100.00';
}

export function integerHint(fieldId?: string): string {
  const example = fieldId ? INTEGER_HINT_EXAMPLES[fieldId] : undefined;
  if (example) return `Whole numbers only — example: ${example}`;
  return 'Whole numbers only';
}
