import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SurveyStateService } from '../../services/survey-state.service';

@Component({
  selector: 'app-org-info',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './org-info.component.html',
  styleUrl: './org-info.component.scss',
})
export class OrgInfoComponent {
  companyName = '';

  constructor(private state: SurveyStateService, private router: Router) {
    this.companyName = this.state.companyName();
  }

  startSurvey(): void {
    if (!this.companyName.trim()) return;
    this.state.companyName.set(this.companyName.trim());
    this.state.syncOrganizationNameToProfile();
    this.state.currentModuleIndex.set(0);
    this.router.navigate(['/survey', 0]);
  }
}
