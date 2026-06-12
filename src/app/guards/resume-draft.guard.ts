import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SurveyStateService } from '../services/survey-state.service';

/** When the user returns to the home page, resume their in-progress survey. */
export const resumeDraftGuard: CanActivateFn = () => {
  const state = inject(SurveyStateService);
  const router = inject(Router);
  const resumeRoute = state.getResumeRoute();

  if (resumeRoute) {
    return router.parseUrl(resumeRoute);
  }

  return true;
};
