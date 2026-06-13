import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyQuestion, formatQuestionDisplayId } from '../../data/survey-data';
import { getSurveyPlaceholder, NUMERIC_INPUT_PLACEHOLDER } from '../../utils/survey-placeholders';
import {
  integerHint,
  percentRateHint,
  resolveSurveyInputKind,
  resolveTableColumnInputKind,
  sanitizeSurveyInput,
} from '../../utils/survey-input.utils';

export interface ConditionalFieldSpec {
  fieldId: string;
  label?: string;
  showWhen: string;
  placeholder?: string;
  inputVariant?: 'rate' | 'integer';
  hint?: string;
  displayOnly?: boolean;
}

@Component({
  selector: 'app-question-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-field.component.html',
  styleUrl: './question-field.component.scss',
})
export class QuestionFieldComponent implements OnInit, OnChanges {
  @Input({ required: true }) moduleName!: string;
  @Input({ required: true }) question!: SurveyQuestion;
  /** False on Organizational Profile; numeric fields never use input placeholders. */
  @Input() showPlaceholders = false;
  @Input() sectionHeader?: SurveyQuestion;
  @Input() conditionalTable?: SurveyQuestion;
  @Input() showTableWhen: string | string[] = '';
  @Input() tableCaption = '';
  @Input() tableValue = '';
  @Input() conditionalFields: ConditionalFieldSpec[] = [];
  @Input() conditionalFieldValues: Record<string, string> = {};
  @Input() value = '';
  @Input() entitlementTableValue = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() tableValueChange = new EventEmitter<string>();
  @Output() entitlementTableValueChange = new EventEmitter<string>();
  @Output() conditionalFieldChange = new EventEmitter<{ id: string; label: string; value: string }>();

  readonly gratuityEntitlementRows = [
    { sl: '1', basic: '1' },
    { sl: '2', basic: '1.5' },
    { sl: '3', basic: '2' },
    { sl: '4', basic: 'Above 2' },
  ];

  otherText = '';
  checkboxValues: string[] = [];
  tableData: Record<string, Record<string, string>> = {};
  entitlementTableData: Record<string, Record<string, string>> = {};

  ngOnInit(): void {
    this.parseValue();
    this.parseConditionalTableValue();
    this.parseEntitlementTableValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.parseValue();
    }
    if (changes['tableValue'] && !changes['tableValue'].firstChange) {
      this.parseConditionalTableValue();
    }
    if (changes['entitlementTableValue'] && !changes['entitlementTableValue'].firstChange) {
      this.parseEntitlementTableValue();
    }
  }

  private parseConditionalTableValue(): void {
    if (!this.conditionalTable) return;
    try {
      this.tableData = this.tableValue ? JSON.parse(this.tableValue) : {};
    } catch {
      this.tableData = {};
    }
  }

  private parseValue(): void {
    if (this.question.type === 'checkbox') {
      try {
        this.checkboxValues = this.value ? JSON.parse(this.value) : [];
      } catch {
        this.checkboxValues = this.value ? [this.value] : [];
      }
    } else if (this.question.type === 'table') {
      try {
        this.tableData = this.value ? JSON.parse(this.value) : {};
      } catch {
        this.tableData = {};
      }
    } else if (this.question.hasInput && this.value.startsWith('Other')) {
      const parts = this.value.split(': ');
      this.otherText = parts.length > 1 ? parts.slice(1).join(': ') : '';
    }
  }

  onRadioChange(option: string): void {
    if (this.useGenericOtherInput(option)) {
      this.emitOther();
    } else {
      this.valueChange.emit(option);
    }
  }

  isOptionSelected(option: string): boolean {
    if (this.question.type === 'checkbox') {
      return this.checkboxValues.includes(option);
    }
    return this.value === option || (this.useGenericOtherInput(option) && this.isOtherSelected());
  }

  allowsMultipleSelection(): boolean {
    return this.question.type === 'checkbox' && this.question.allowMultiple === true;
  }

  onOptionClick(option: string): void {
    if (this.question.type === 'checkbox') {
      if (this.allowsMultipleSelection()) {
        this.toggleCheckbox(option, !this.checkboxValues.includes(option));
        return;
      }

      if (this.checkboxValues.includes(option)) {
        this.toggleCheckbox(option, false);
        return;
      }

      this.clearCheckboxSelection();
      this.checkboxValues = [option];
      this.onCheckboxChange();
      return;
    }

    if (this.isOptionSelected(option)) {
      this.otherText = '';
      this.valueChange.emit('');
      return;
    }

    this.otherText = '';
    this.onRadioChange(option);
  }

  private clearCheckboxSelection(): void {
    for (const opt of this.checkboxValues) {
      for (const field of this.getFieldsForOption(opt)) {
        if (this.getConditionalFieldValue(field.fieldId)) {
          this.onConditionalFieldInput(field, '');
        }
      }
    }
  }

  onOtherInput(): void {
    this.emitOther();
  }

  private emitOther(): void {
    this.valueChange.emit(
      this.otherText ? `Other — please specify: ${this.otherText}` : 'Other — please specify'
    );
  }

  onCheckboxChange(): void {
    this.valueChange.emit(JSON.stringify(this.checkboxValues));
  }

  toggleCheckbox(opt: string, checked: boolean): void {
    if (checked) {
      if (!this.checkboxValues.includes(opt)) this.checkboxValues = [...this.checkboxValues, opt];
    } else {
      this.checkboxValues = this.checkboxValues.filter(v => v !== opt);
      for (const field of this.getFieldsForOption(opt)) {
        if (this.getConditionalFieldValue(field.fieldId)) {
          this.onConditionalFieldInput(field, '');
        }
      }
    }
    this.onCheckboxChange();
  }

  onTableInput(row: string, col: string, val: string): void {
    if (!this.tableData[row]) this.tableData[row] = {};
    this.tableData[row][col] = val;
    const payload = JSON.stringify(this.tableData);
    if (this.conditionalTable) {
      this.tableValueChange.emit(payload);
    } else {
      this.valueChange.emit(payload);
    }
  }

  tableColumnInputVariant(column: string): 'rate' | 'integer' | undefined {
    const kind = resolveTableColumnInputKind(column);
    if (kind === 'percentRate') return 'rate';
    if (kind === 'integer') return 'integer';
    return undefined;
  }

  handleTableValidatedInput(event: Event, row: string, col: string): void {
    const input = event.target as HTMLInputElement;
    const variant = this.tableColumnInputVariant(col);
    const sanitized = sanitizeSurveyInput(input.value, `table_${col}`, variant);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    this.onTableInput(row, col, sanitized);
  }

  handleTableValidatedPaste(event: ClipboardEvent, row: string, col: string): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const variant = this.tableColumnInputVariant(col);
    const sanitized = sanitizeSurveyInput(merged, `table_${col}`, variant);
    input.value = sanitized;
    this.onTableInput(row, col, sanitized);
  }

  blockInvalidTableKey(event: KeyboardEvent, col: string): void {
    this.blockInvalidSurveyKey(event, `table_${col}`, this.tableColumnInputVariant(col));
  }

  getTableCell(row: string, col: string): string {
    return this.tableData[row]?.[col] ?? '';
  }

  private parseEntitlementTableValue(): void {
    try {
      this.entitlementTableData = this.entitlementTableValue ? JSON.parse(this.entitlementTableValue) : {};
    } catch {
      this.entitlementTableData = {};
    }
  }

  getEntitlementTableCell(sl: string, col: string): string {
    return this.entitlementTableData[sl]?.[col] ?? '';
  }

  onEntitlementTableInput(sl: string, col: string, val: string): void {
    if (!this.entitlementTableData[sl]) this.entitlementTableData[sl] = {};
    this.entitlementTableData[sl][col] = val;
    this.entitlementTableValueChange.emit(JSON.stringify(this.entitlementTableData));
  }

  isOtherSelected(): boolean {
    return this.value.startsWith('Other') || this.value === 'Other — please specify';
  }

  showConditionalTable(): boolean {
    if (!this.conditionalTable || !this.showTableWhen) return false;
    if (Array.isArray(this.showTableWhen)) {
      return this.showTableWhen.includes(this.value);
    }
    return this.value === this.showTableWhen;
  }

  get activeTable(): SurveyQuestion | undefined {
    return this.conditionalTable ?? (this.question.type === 'table' ? this.question : undefined);
  }

  get rowHeaderLabel(): string {
    return this.activeTable?.label || 'Row';
  }

  getFieldsForOption(option: string): ConditionalFieldSpec[] {
    return this.conditionalFields.filter(f => f.showWhen === option);
  }

  useGenericOtherInput(option: string): boolean {
    if (!this.question.hasInput || !option.includes('Other')) return false;
    return !this.conditionalFields.some(f => f.showWhen === option);
  }

  showGenericOtherInput(option: string): boolean {
    return this.useGenericOtherInput(option) && (this.value === option || this.isOtherSelected());
  }

  getConditionalFieldValue(fieldId: string): string {
    return this.conditionalFieldValues[fieldId] ?? '';
  }

  handleValidatedInput(event: Event, fieldId?: string, inputVariant?: 'rate' | 'integer'): void {
    const input = event.target as HTMLInputElement;
    const id = fieldId ?? this.question.id;
    const sanitized = sanitizeSurveyInput(input.value, id, inputVariant);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    this.valueChange.emit(sanitized);
  }

  handleValidatedPaste(event: ClipboardEvent, fieldId?: string, inputVariant?: 'rate' | 'integer'): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const id = fieldId ?? this.question.id;
    const sanitized = sanitizeSurveyInput(merged, id, inputVariant);
    input.value = sanitized;
    this.valueChange.emit(sanitized);
  }

  handleConditionalValidatedInput(event: Event, field: ConditionalFieldSpec): void {
    const input = event.target as HTMLInputElement;
    const sanitized = sanitizeSurveyInput(input.value, field.fieldId, field.inputVariant);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    this.conditionalFieldChange.emit({ id: field.fieldId, label: field.label ?? '', value: sanitized });
  }

  handleConditionalValidatedPaste(event: ClipboardEvent, field: ConditionalFieldSpec): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = sanitizeSurveyInput(merged, field.fieldId, field.inputVariant);
    input.value = sanitized;
    this.conditionalFieldChange.emit({ id: field.fieldId, label: field.label ?? '', value: sanitized });
  }

  onConditionalFieldInput(field: ConditionalFieldSpec, value: string): void {
    this.conditionalFieldChange.emit({ id: field.fieldId, label: field.label ?? '', value });
  }

  blockInvalidSurveyKey(event: KeyboardEvent, fieldId: string, inputVariant?: 'rate' | 'integer'): void {
    const kind = resolveSurveyInputKind(fieldId, inputVariant);
    if (kind === 'text') return;

    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (kind === 'integer' && /^\d$/.test(event.key)) return;

    if (kind === 'percentRate') {
      if (/^\d$/.test(event.key)) return;
      if (event.key === '.') {
        const input = event.target as HTMLInputElement;
        if (!input.value.includes('.')) return;
      }
    }

    event.preventDefault();
  }

  inputHint(fieldId: string, inputVariant?: 'rate' | 'integer'): string {
    const kind = resolveSurveyInputKind(fieldId, inputVariant);
    if (kind === 'percentRate') return percentRateHint(fieldId);
    if (kind === 'integer') return integerHint(fieldId);
    return '';
  }

  placeholderFor(fieldId: string, inputVariant?: 'rate' | 'integer', custom?: string): string {
    return getSurveyPlaceholder(fieldId, inputVariant, custom, this.showPlaceholders);
  }

  tableInputPlaceholder(): string {
    return this.showPlaceholders ? NUMERIC_INPUT_PLACEHOLDER : '';
  }

  displayQuestionId(questionId: string): string {
    return formatQuestionDisplayId(this.moduleName, questionId);
  }

  showQuestionNumber(questionId: string): boolean {
    return !questionId.includes('_sub_');
  }
}
