import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyStateService } from '../../services/survey-state.service';
import { SurveyApiService } from '../../services/survey-api.service';
import {
  SURVEY_MODULES,
  SurveyQuestion,
  getDisplayModuleNumber,
  getNumberedModuleCount,
  isNumberedSurveyModule,
} from '../../data/survey-data';
import { MODULE_SKIP_GATES } from '../../data/survey-skip-gates';
import { QuestionFieldComponent, ConditionalFieldSpec } from '../../components/question-field/question-field.component';
import { FormFieldGroupComponent, FormFieldSpec } from '../../components/form-field-group/form-field-group.component';

@Component({
  selector: 'app-module-survey',
  standalone: true,
  imports: [QuestionFieldComponent, FormFieldGroupComponent],
  templateUrl: './module-survey.component.html',
  styleUrl: './module-survey.component.scss',
})
export class ModuleSurveyComponent implements OnInit {
  modules = SURVEY_MODULES;
  moduleIndex = 0;
  submitting = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public state: SurveyStateService,
    private api: SurveyApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.moduleIndex = Number(params.get('index') ?? 0);
      if (!this.state.companyName()) {
        this.router.navigate(['/organization']);
        return;
      }
      this.state.setLastRoute(`/survey/${this.moduleIndex}`);
      if (this.moduleIndex === 0) {
        this.state.syncOrganizationNameToProfile();
      }
      this.scrollToTop();
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  get currentModule() {
    return this.modules[this.moduleIndex];
  }

  get isNumberedModule(): boolean {
    return isNumberedSurveyModule(this.moduleIndex);
  }

  get displayModuleNumber(): number {
    return getDisplayModuleNumber(this.moduleIndex);
  }

  get totalNumberedModules(): number {
    return getNumberedModuleCount();
  }

  get progressPercent(): number {
    if (!this.isNumberedModule) return 0;
    return Math.round((this.displayModuleNumber / this.totalNumberedModules) * 100);
  }

  get moduleSkipGate() {
    return this.moduleSkipGates[this.currentModule.name];
  }

  get isModuleSkipped(): boolean {
    const gate = this.moduleSkipGate;
    if (!gate) return false;
    const answer = this.state.getAnswer(this.currentModule.name, gate.questionId);
    return gate.skipWhen.includes(answer);
  }

  isQuestionVisible(questionId: string): boolean {
    if (this.currentModule.name === 'Provident Fund') {
      const withdrawAnswer = this.state.getAnswer('Provident Fund', 'PF_1_9');
      const reentryAnswer = this.state.getAnswer('Provident Fund', 'PF_1_9_sub_reentry');
      if (questionId === 'PF_1_9_sub_reentry') return withdrawAnswer === 'Yes';
      if (questionId === 'PF_1_9_sub_times') return withdrawAnswer === 'Yes' && reentryAnswer === 'Yes';

      const loanAnswer = this.state.getAnswer('Provident Fund', 'PF_1_10');
      const loanFollowUpIds = ['PF_1_11', 'PF_1_12', 'PF_1_13'];
      if (loanFollowUpIds.includes(questionId)) return loanAnswer === 'Yes';
    }

    if (this.currentModule.name === 'Retirement Age') {
      const extensionAnswer = this.state.getAnswer('Retirement Age', 'RA_4_3');
      if (questionId === 'RA_table_4_4') {
        return this.postRetirementExtensionYes.includes(extensionAnswer);
      }
    }

    if (!this.isModuleSkipped) return true;
    const gate = this.moduleSkipGate;
    if (!gate) return true;

    const gateIndex = this.currentModule.questions.findIndex(q => q.id === gate.questionId);
    const questionIndex = this.currentModule.questions.findIndex(q => q.id === questionId);
    return questionIndex <= gateIndex;
  }

  /** When answered with skipWhen, remaining module questions are not applicable. */
  private readonly moduleSkipGates = MODULE_SKIP_GATES;

  /** Section headers merged into the following table question. */
  private readonly tableSectionHeaders: Record<string, string> = {
    RA_table_4_4: 'RA_4_sub_extension_terms',
    ET_table_5_1: 'ET_5_1',
    ET_table_5_2: 'ET_5_2',
    MP_table_6_2: 'MP_6_2',
  };

  private readonly postRetirementExtensionYes = [
    'Yes — fixed extension period (e.g., up to 2 years)',
    'Yes — discretionary, subject to performance / business need',
  ];

  /** Radio questions with a conditional table when a specific option is selected. */
  private readonly conditionalRadioTables: Record<
    string,
    { tableId: string; showWhen: string | string[]; caption: string }
  > = {
    PF_1_5: {
      tableId: 'PF_table_1_5',
      showWhen: 'Grade wise contributions',
      caption: 'If yes, please complete the table below:',
    },
    RA_4_2: {
      tableId: 'RA_table_4_2',
      showWhen: [
        'Varies by grade — senior grades have higher retirement age',
        'Varies by employment contract type',
      ],
      caption: 'If it varies, please provide details below:',
    },
  };

  /** Questions with conditional inline fields when a specific option is selected. */
  private readonly conditionalFields: Record<string, ConditionalFieldSpec[]> = {
    PF_1_2: [
      {
        fieldId: 'PF_1_2_minimum_service',
        label: 'Minimum service period required',
        showWhen: 'Employees after a minimum service period — specify below',
      },
    ],
    PF_1_4: [
      {
        fieldId: 'PF_1_4_employer_contribution',
        label: 'Employer contribution %',
        showWhen: 'Partial match — please specify % below',
        inputVariant: 'rate',
      },
      {
        fieldId: 'PF_1_4_employee_contribution',
        label: 'Employee contribution %',
        showWhen: 'Partial match — please specify % below',
        inputVariant: 'rate',
      },
      {
        fieldId: 'PF_1_4_details',
        label: 'Details',
        showWhen: 'Other — please specify',
      },
    ],
    GF_2_4: [
      {
        fieldId: 'GF_2_4_scale_details',
        label: 'Scale details',
        showWhen: 'Graduated scale — increases with tenure',
      },
    ],
    LE_3_3: [
      {
        fieldId: 'LE_3_3_days',
        label: 'Number of days',
        showWhen: 'Number of days',
        inputVariant: 'integer',
      },
      {
        fieldId: 'LE_3_3_percentage',
        label: 'Percentage',
        showWhen: 'Percentage',
        inputVariant: 'integer',
      },
    ],
    LE_3_5: [
      {
        fieldId: 'LE_3_5_days',
        label: 'In days',
        showWhen: 'In days',
        inputVariant: 'integer',
      },
    ],
    LE_3_7: [
      {
        fieldId: 'LE_3_7_ctc_formula',
        hint: 'Formula: Basic salary ÷ (working days) × encashable days',
        showWhen: 'CTC Based',
        displayOnly: true,
      },
      {
        fieldId: 'LE_3_7_basic_working_days',
        label: 'How many days do you count as working days?',
        hint: 'Formula: Basic salary ÷ (working days) × encashable days',
        showWhen: 'Basic Based',
        inputVariant: 'integer',
      },
      {
        fieldId: 'LE_3_7_gross_working_days',
        label: 'How many days do you count as working days?',
        hint: 'Formula: Gross salary ÷ (working days) × encashable days',
        showWhen: 'Gross Based',
        inputVariant: 'integer',
      },
    ],
    LE_3_8: [
      {
        fieldId: 'LE_3_8_maximum_carry_forward_days',
        label: 'Maximum carry-forward days',
        showWhen: 'Carry-forward permitted — capped at specific days (specify below)',
        inputVariant: 'integer',
      },
    ],
    RA_4_1: [
      {
        fieldId: 'RA_4_1_years',
        label: 'Years',
        showWhen: 'Specify retirement age in years',
        inputVariant: 'integer',
      },
    ],
    ET_5_7: [
      {
        fieldId: 'ET_5_7_reduced_notice',
        label: 'Reduced notice period',
        showWhen: 'Reduced notice (specify below)',
      },
    ],
  };

  private readonly groupedFieldIds = new Set([
    'OP_4_name', 'OP_4_designation', 'OP_4_email',
  ]);

  readonly op4Fields: FormFieldSpec[][] = [
    [
      { id: 'OP_4_name', label: 'Full name' },
      { id: 'OP_4_designation', label: 'Designation' },
    ],
    [
      { id: 'OP_4_email', label: 'Email address', type: 'email' },
    ],
  ];

  skipQuestion(questionId: string): boolean {
    if (this.groupedFieldIds.has(questionId)) return true;
    if (questionId === 'GF_2_6' || questionId === 'GF_table_2_6') return true;
    if (Object.values(this.tableSectionHeaders).includes(questionId)) return true;
    if (questionId.includes('_if_yes_please_complete_the_table_below')) return true;
    if (Object.values(this.conditionalRadioTables).some(c => c.tableId === questionId)) return true;
    if (Object.values(this.conditionalFields).flat().some(f => f.fieldId === questionId)) return true;
    return false;
  }

  getConditionalFieldsFor(questionId: string): ConditionalFieldSpec[] {
    return this.conditionalFields[questionId] ?? [];
  }

  getConditionalFieldValues(questionId: string): Record<string, string> {
    const fields = this.getConditionalFieldsFor(questionId);
    const values: Record<string, string> = {};
    for (const field of fields) {
      values[field.fieldId] = this.state.getAnswer(this.currentModule.name, field.fieldId);
    }
    return values;
  }

  getTableConfigFor(questionId: string) {
    const config = this.conditionalRadioTables[questionId];
    if (!config) return null;
    const table = this.currentModule.questions.find(q => q.id === config.tableId);
    if (!table) return null;
    return { table, showWhen: config.showWhen, caption: config.caption };
  }

  getTableSectionHeader(question: SurveyQuestion): SurveyQuestion | undefined {
    const headerId = this.tableSectionHeaders[question.id];
    if (!headerId) return undefined;
    return this.currentModule.questions.find(q => q.id === headerId);
  }

  getFieldGroupValues(fieldIds: string[]): Record<string, string> {
    const values: Record<string, string> = {};
    for (const id of fieldIds) {
      values[id] = this.state.getAnswer(this.currentModule.name, id);
    }
    return values;
  }

  getOp4Values(): Record<string, string> {
    return this.getFieldGroupValues(['OP_4_name', 'OP_4_designation', 'OP_4_email']);
  }

  onGroupFieldChange(event: { id: string; label: string; value: string }): void {
    this.onAnswer(event.id, event.label, event.value);
  }

  onConditionalFieldChange(event: { id: string; label: string; value: string }): void {
    this.onAnswer(event.id, event.label, event.value);
  }

  get moduleDescription(): string {
    return this.currentModule.description ?? '';
  }

  onAnswer(questionId: string, label: string, value: string): void {
    this.state.setAnswer(this.currentModule.name, questionId, label, value);
    if (questionId === 'OP_1') {
      this.state.companyName.set(value.trim());
    }

    if (this.currentModule.name === 'Provident Fund') {
      if (questionId === 'PF_1_9' && value !== 'Yes') {
        this.state.clearAnswers(this.currentModule.name, ['PF_1_9_sub_reentry', 'PF_1_9_sub_times']);
      }
      if (questionId === 'PF_1_9_sub_reentry' && value !== 'Yes') {
        this.state.clearAnswers(this.currentModule.name, ['PF_1_9_sub_times']);
      }
    }

    if (this.currentModule.name === 'Retirement Age') {
      if (
        questionId === 'RA_4_3' &&
        !this.postRetirementExtensionYes.includes(value)
      ) {
        this.state.clearAnswers(this.currentModule.name, ['RA_table_4_4']);
      }
    }

    const gate = this.moduleSkipGate;
    if (gate && questionId === gate.questionId && gate.skipWhen.includes(value)) {
      this.state.clearModuleAnswersAfter(this.currentModule.name, gate.questionId);
    }
  }

  prev(): void {
    if (this.moduleIndex === 0) {
      this.router.navigate(['/organization']);
    } else {
      this.router.navigate(['/survey', this.moduleIndex - 1]);
    }
  }

  next(): void {
    this.router.navigate(['/survey', this.moduleIndex + 1]);
  }

  submit(): void {
    this.submitting = true;
    this.error = '';
    this.api.submit(this.state.buildPayload()).subscribe({
      next: res => {
        this.state.completeSubmission(res.submissionId);
        this.router.navigate(['/success']);
      },
      error: err => {
        this.error = err?.error?.message || err.message || 'Submission failed';
        this.submitting = false;
      },
    });
  }
}
