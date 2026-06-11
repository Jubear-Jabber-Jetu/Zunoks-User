import { SURVEY_MODULES, SurveyModule } from './survey-data';

export interface ModuleSkipGate {
  questionId: string;
  skipWhen: string[];
  message: string;
}

const EXCLUDED_MODULES = new Set(['Organizational Profile']);

/** Options that mean the whole module is not applicable (first gate question only). */
const MODULE_SKIP_OPTION_MATCHERS: Array<(option: string) => boolean> = [
  opt => opt === 'No — do not provide',
  opt => opt.startsWith('No — we do not operate'),
  opt => opt === 'No — leave must be used or forfeited',
  opt => opt === 'No formal policy',
];

const SKIP_MESSAGES: Record<string, string> = {
  'Provident Fund':
    'You indicated your organization does not operate a PF scheme. The remaining questions in this module are not applicable.',
  Gratuity:
    'You indicated your organization does not provide Gratuity. The remaining questions in this module are not applicable.',
  'Leave Encashment':
    'You indicated your organization does not allow annual leave encashment. The remaining questions in this module are not applicable.',
  'Mobile Phone Set Policy':
    'You indicated your organization does not have a formal mobile phone set policy. The remaining questions in this module are not applicable.',
};

function isSkipOption(option: string): boolean {
  return MODULE_SKIP_OPTION_MATCHERS.some(match => match(option));
}

function findGateQuestion(module: SurveyModule) {
  return module.questions.find(
    q =>
      q.type === 'radio' &&
      /^Does your organization/i.test(q.label) &&
      q.options?.some(isSkipOption)
  );
}

function defaultMessage(moduleName: string, questionLabel: string): string {
  return `Based on your answer to "${questionLabel}", the remaining questions in ${moduleName} are not applicable.`;
}

export function buildModuleSkipGates(modules: SurveyModule[] = SURVEY_MODULES): Record<string, ModuleSkipGate> {
  const gates: Record<string, ModuleSkipGate> = {};

  for (const module of modules) {
    if (EXCLUDED_MODULES.has(module.name)) continue;

    const gateQuestion = findGateQuestion(module);
    if (!gateQuestion?.options) continue;

    const skipWhen = gateQuestion.options.filter(isSkipOption);
    if (!skipWhen.length) continue;

    gates[module.name] = {
      questionId: gateQuestion.id,
      skipWhen,
      message: SKIP_MESSAGES[module.name] ?? defaultMessage(module.name, gateQuestion.label),
    };
  }

  return gates;
}

export const MODULE_SKIP_GATES = buildModuleSkipGates();
