import { effect, Injectable, signal } from '@angular/core';
import { SURVEY_MODULES } from '../data/survey-data';

const DRAFT_STORAGE_KEY = 'zunoks-survey-draft';
const SAVE_PROGRESS_PREF_KEY = 'zunoks-save-progress';

interface SurveyDraft {
  companyName: string;
  currentModuleIndex: number;
  responses: Record<string, Record<string, string>>;
  questionLabels: Record<string, Record<string, string>>;
  lastRoute: string;
  introAcknowledged: boolean;
}

@Injectable({ providedIn: 'root' })
export class SurveyStateService {
  readonly companyName = signal('');
  readonly currentModuleIndex = signal(0);
  readonly submissionId = signal<number | null>(null);
  readonly responses = signal<Record<string, Record<string, string>>>({});
  readonly questionLabels = signal<Record<string, Record<string, string>>>({});
  readonly introAcknowledged = signal(false);
  readonly lastRoute = signal('/');
  readonly saveProgressEnabled = signal(this.loadSaveProgressPreference());

  readonly selectedModules = SURVEY_MODULES.map(m => m.name);

  private persistDraft = true;

  constructor() {
    this.loadDraft();

    effect(() => {
      if (!this.persistDraft || !this.saveProgressEnabled()) return;

      const draft: SurveyDraft = {
        companyName: this.companyName(),
        currentModuleIndex: this.currentModuleIndex(),
        responses: this.responses(),
        questionLabels: this.questionLabels(),
        lastRoute: this.lastRoute(),
        introAcknowledged: this.introAcknowledged(),
      };

      if (this.hasDraftContent(draft)) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    });
  }

  reset(): void {
    this.persistDraft = false;
    this.companyName.set('');
    this.currentModuleIndex.set(0);
    this.submissionId.set(null);
    this.responses.set({});
    this.questionLabels.set({});
    this.introAcknowledged.set(false);
    this.lastRoute.set('/');
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    this.persistDraft = true;
  }

  clearPersistedDraft(): void {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  setSaveProgressEnabled(enabled: boolean): void {
    this.saveProgressEnabled.set(enabled);
    localStorage.setItem(SAVE_PROGRESS_PREF_KEY, JSON.stringify(enabled));
    if (!enabled) {
      this.clearPersistedDraft();
    }
  }

  /** Clear all survey progress after a successful submission (keeps submissionId for download). */
  completeSubmission(submissionId: number): void {
    this.persistDraft = false;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    this.companyName.set('');
    this.currentModuleIndex.set(0);
    this.responses.set({});
    this.questionLabels.set({});
    this.introAcknowledged.set(false);
    this.lastRoute.set('/');
    this.submissionId.set(submissionId);
    this.persistDraft = true;
  }

  setLastRoute(route: string): void {
    const normalized = route.split('?')[0] || '/';
    this.lastRoute.set(normalized);

    const match = normalized.match(/^\/survey\/(\d+)$/);
    if (match) {
      this.currentModuleIndex.set(Number(match[1]));
    }
  }

  getResumeRoute(): string | null {
    if (!this.saveProgressEnabled() || !this.hasPersistedDraft()) return null;

    const route = this.lastRoute();
    if (route && route !== '/' && route !== '/success') {
      return route;
    }

    if (this.companyName().trim()) {
      return `/survey/${this.currentModuleIndex()}`;
    }

    if (this.introAcknowledged()) {
      return '/organization';
    }

    return null;
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

  private loadSaveProgressPreference(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_PROGRESS_PREF_KEY);
      if (raw === null) return true;
      return JSON.parse(raw) === true;
    } catch {
      return true;
    }
  }

  private loadDraft(): void {
    if (!this.saveProgressEnabled()) return;

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw) as Partial<SurveyDraft>;
      this.persistDraft = false;
      this.companyName.set(draft.companyName ?? '');
      this.currentModuleIndex.set(draft.currentModuleIndex ?? 0);
      this.responses.set(draft.responses ?? {});
      this.questionLabels.set(draft.questionLabels ?? {});
      this.lastRoute.set(draft.lastRoute ?? '/');
      this.introAcknowledged.set(draft.introAcknowledged ?? false);
      this.persistDraft = true;
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }

  private hasPersistedDraft(): boolean {
    return localStorage.getItem(DRAFT_STORAGE_KEY) !== null;
  }

  private hasDraftContent(draft: SurveyDraft): boolean {
    if (draft.introAcknowledged) return true;
    if (draft.companyName.trim()) return true;
    return Object.values(draft.responses).some(module =>
      Object.values(module).some(value => value.trim() !== '')
    );
  }
}
