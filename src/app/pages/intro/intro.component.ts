import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { INSTRUCTIONS, SURVEY_META, getNumberedModuleCount } from '../../data/survey-data';
import { SurveyStateService } from '../../services/survey-state.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent implements OnInit {
  meta = SURVEY_META;
  instructions = INSTRUCTIONS;
  moduleCount = getNumberedModuleCount();
  acknowledged = false;

  constructor(private state: SurveyStateService) {
    this.acknowledged = this.state.introAcknowledged();
  }

  instructionParts(text: string): Array<{ type: 'text' | 'email'; value: string }> {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (!emailMatch || emailMatch.index === undefined) {
      return [{ type: 'text', value: text }];
    }

    const email = emailMatch[1];
    const before = text.slice(0, emailMatch.index);
    const after = text.slice(emailMatch.index + email.length);
    const parts: Array<{ type: 'text' | 'email'; value: string }> = [];

    if (before) parts.push({ type: 'text', value: before });
    parts.push({ type: 'email', value: email });
    if (after) parts.push({ type: 'text', value: after });

    return parts;
  }

  ngOnInit(): void {
    this.state.setLastRoute('/');
  }

  onAcknowledgedChange(value: boolean): void {
    this.state.introAcknowledged.set(value);
  }
}
