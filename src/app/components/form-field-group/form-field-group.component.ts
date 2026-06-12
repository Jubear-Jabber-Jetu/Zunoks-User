import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getSurveyPlaceholder } from '../../utils/survey-placeholders';

export interface FormFieldSpec {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'date';
  placeholder?: string;
}

@Component({
  selector: 'app-form-field-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-field-group.component.html',
  styleUrl: './form-field-group.component.scss',
})
export class FormFieldGroupComponent {
  @Input({ required: true }) sectionId!: string;
  @Input({ required: true }) title!: string;
  @Input() note = '';
  @Input({ required: true }) fields!: FormFieldSpec[][];
  @Input({ required: true }) values!: Record<string, string>;
  @Input() showPlaceholders = false;
  @Output() fieldChange = new EventEmitter<{ id: string; label: string; value: string }>();

  displayId(): string {
    return this.sectionId.replace('_', '.');
  }

  onInput(field: FormFieldSpec, value: string): void {
    this.fieldChange.emit({ id: field.id, label: field.label, value });
  }

  getValue(fieldId: string): string {
    return this.values[fieldId] ?? '';
  }

  placeholderFor(field: FormFieldSpec): string {
    return getSurveyPlaceholder(field.id, undefined, field.placeholder, this.showPlaceholders);
  }
}
