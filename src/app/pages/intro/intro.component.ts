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

  ngOnInit(): void {
    this.state.setLastRoute('/');
  }

  onAcknowledgedChange(value: boolean): void {
    this.state.introAcknowledged.set(value);
  }
}
