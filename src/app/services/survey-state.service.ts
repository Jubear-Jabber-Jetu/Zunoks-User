import { Injectable, signal } from '@angular/core';
import { SURVEY_MODULES } from '../data/survey-data';

@Injectable({ providedIn: 'root' })
export class SurveyStateService {
  readonly companyName = signal('');
  readonly currentModuleIndex = signal(0);
  readonly submissionId = signal<number | null>(null);
  readonly responses = signal<Record<string, Record<string, string>>>({});
  readonly questionLabels = signal<Record<string, Record<string, string>>>({});

  readonly selectedModules = SURVEY_MODULES.map(m => m.name);

  reset(): void {
    this.companyName.set('');
    this.currentModuleIndex.set(0);
    this.submissionId.set(null);
    this.responses.set({});
    this.questionLabels.set({});
  }

  ensureModule(moduleName: string): void {
    const responses = { ...this.responses() };
    const labels = { ...this.questionLabels() };
    if (!responses[moduleName]) responses[moduleName] = {};
    if (!labels[moduleName]) labels[moduleName] = {};
    this.responses.set(responses);
    this.questionLabels.set(labels);
  }

  setAnswer(moduleName: string, questionId: string, label: string, value: string): void {
    this.ensureModule(moduleName);
    this.responses.update(r => ({
      ...r,
      [moduleName]: { ...r[moduleName], [questionId]: value },
    }));
    this.questionLabels.update(l => ({
      ...l,
      [moduleName]: { ...l[moduleName], [questionId]: label },
    }));
  }

  clearAnswers(moduleName: string, questionIds: string[]): void {
    if (!questionIds.length) return;

    this.responses.update(r => {
      const moduleResponses = { ...(r[moduleName] ?? {}) };
      for (const id of questionIds) delete moduleResponses[id];
      return { ...r, [moduleName]: moduleResponses };
    });
    this.questionLabels.update(l => {
      const moduleLabels = { ...(l[moduleName] ?? {}) };
      for (const id of questionIds) delete moduleLabels[id];
      return { ...l, [moduleName]: moduleLabels };
    });
  }

  clearModuleAnswersAfter(moduleName: string, afterQuestionId: string): void {
    const module = SURVEY_MODULES.find(m => m.name === moduleName);
    if (!module) return;

    const gateIndex = module.questions.findIndex(q => q.id === afterQuestionId);
    if (gateIndex < 0) return;

    const idsToClear = module.questions.slice(gateIndex + 1).map(q => q.id);
    this.responses.update(r => {
      const moduleResponses = { ...(r[moduleName] ?? {}) };
      for (const id of idsToClear) delete moduleResponses[id];
      return { ...r, [moduleName]: moduleResponses };
    });
    this.questionLabels.update(l => {
      const moduleLabels = { ...(l[moduleName] ?? {}) };
      for (const id of idsToClear) delete moduleLabels[id];
      return { ...l, [moduleName]: moduleLabels };
    });
  }

  /** Prefill OP.1 from the organization name entered on the previous page. */
  syncOrganizationNameToProfile(): void {
    const name = this.companyName().trim();
    if (!name) return;

    this.setAnswer('Organizational Profile', 'OP_1', 'Organization name', name);
  }

  getAnswer(moduleName: string, questionId: string): string {
    const raw = this.responses()[moduleName]?.[questionId] ?? '';

    if (moduleName === 'Organizational Profile' && questionId === 'OP_1') {
      return raw || this.companyName();
    }

    if (moduleName === 'Organizational Profile' && questionId === 'OP_2' && raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.inline ?? parsed.details ?? '';
      } catch {
        return raw;
      }
    }

    return raw;
  }

  buildPayload() {
    return {
      companyName: this.companyName(),
      selectedModules: this.selectedModules,
      responses: this.responses(),
      questionLabels: this.questionLabels(),
    };
  }
}
