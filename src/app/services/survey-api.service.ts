import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ZunoksSubmissionPayload {
  companyName: string;
  selectedModules: string[];
  responses: Record<string, Record<string, string>>;
  questionLabels: Record<string, Record<string, string>>;
}

export interface SubmitResponse {
  message: string;
  submissionId: number;
}

@Injectable({ providedIn: 'root' })
export class SurveyApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  submit(payload: ZunoksSubmissionPayload): Observable<SubmitResponse> {
    return this.http.post<SubmitResponse>(`${this.baseUrl}/api/survey/submit`, payload);
  }

  getDownloadUrl(submissionId: number): string {
    return `${this.baseUrl}/api/survey/download/${submissionId}`;
  }
}
