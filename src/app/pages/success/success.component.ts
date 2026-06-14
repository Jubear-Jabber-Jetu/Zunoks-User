import { Component } from '@angular/core';
import { SurveyStateService } from '../../services/survey-state.service';
import { SurveyApiService } from '../../services/survey-api.service';

@Component({
  selector: 'app-success',
  standalone: true,
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss',
})
export class SuccessComponent {
  downloaded = false;

  constructor(public state: SurveyStateService, private api: SurveyApiService) {}

  download(): void {
    const id = this.state.submissionId();
    if (id) {
      window.open(this.api.getDownloadUrl(id), '_blank');
      this.downloaded = true;
    }
  }
}
