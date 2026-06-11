import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyQuestion, formatQuestionDisplayId } from '../../data/survey-data';

export interface ConditionalFieldSpec {
  fieldId: string;
  label: string;
  showWhen: string;
  placeholder?: string;
  inputVariant?: 'rate';
  hint?: string;
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
  @Input() sectionHeader?: SurveyQuestion;
  @Input() conditionalTable?: SurveyQuestion;
  @Input() showTableWhen: string | string[] = '';
  @Input() tableCaption = '';
  @Input() tableValue = '';
  @Input() conditionalFields: ConditionalFieldSpec[] = [];
  @Input() conditionalFieldValues: Record<string, string> = {};
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() tableValueChange = new EventEmitter<string>();
  @Output() conditionalFieldChange = new EventEmitter<{ id: string; label: string; value: string }>();

  otherText = '';
  checkboxValues: string[] = [];
  tableData: Record<string, Record<string, string>> = {};

  ngOnInit(): void {
    this.parseValue();
    this.parseConditionalTableValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.parseValue();
    }
    if (changes['tableValue'] && !changes['tableValue'].firstChange) {
      this.parseConditionalTableValue();
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

  getTableCell(row: string, col: string): string {
    return this.tableData[row]?.[col] ?? '';
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

  onConditionalFieldInput(field: ConditionalFieldSpec, value: string): void {
    this.conditionalFieldChange.emit({ id: field.fieldId, label: field.label, value });
  }

  displayQuestionId(questionId: string): string {
    return formatQuestionDisplayId(this.moduleName, questionId);
  }

  showQuestionNumber(questionId: string): boolean {
    return !questionId.includes('_sub_');
  }
}
