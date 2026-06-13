import { resolveSurveyInputKind } from './survey-input.utils';

/** Placeholder for rate / integer inputs — clearly not a sample value. */
export const NUMERIC_INPUT_PLACEHOLDER = 'Input here';

/** Soft text-only placeholders for module questions — never example numbers. */
const TEXT_MODULE_PLACEHOLDERS: Record<string, string> = {
  OTHER_SPECIFY: 'Add details',
  PF_1_2_minimum_service: 'Describe the minimum period',
  PF_1_4_details: 'Add policy details',
  GF_2_4_scale_details: 'Describe the scale',
  ET_5_7_reduced_notice: 'Describe the notice period',
  GENERIC_TEXT: 'Type your answer',
};

export function getSurveyPlaceholder(
  fieldId: string,
  inputVariant?: 'rate' | 'integer',
  custom?: string,
  allowPlaceholder = true
): string {
  if (!allowPlaceholder) return '';
  if (custom?.trim()) return custom;

  const kind = resolveSurveyInputKind(fieldId, inputVariant);
  if (kind === 'percentRate' || kind === 'integer') return NUMERIC_INPUT_PLACEHOLDER;

  return TEXT_MODULE_PLACEHOLDERS[fieldId] ?? TEXT_MODULE_PLACEHOLDERS['GENERIC_TEXT'];
}
