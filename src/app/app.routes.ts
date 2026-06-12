import { Routes } from '@angular/router';
import { IntroComponent } from './pages/intro/intro.component';
import { OrgInfoComponent } from './pages/org-info/org-info.component';
import { ModuleSurveyComponent } from './pages/module-survey/module-survey.component';
import { SuccessComponent } from './pages/success/success.component';
import { resumeDraftGuard } from './guards/resume-draft.guard';

export const routes: Routes = [
  { path: '', component: IntroComponent, canActivate: [resumeDraftGuard] },
  { path: 'organization', component: OrgInfoComponent },
  { path: 'organisation', redirectTo: 'organization', pathMatch: 'full' },
  { path: 'survey/:index', component: ModuleSurveyComponent },
  { path: 'success', component: SuccessComponent },
  { path: '**', redirectTo: '' },
];
