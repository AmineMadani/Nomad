import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { ReportQuestionDto } from '../../models/reportQuestion.model';

@Injectable({
  providedIn: 'root',
})
export class ReportQuestionDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * Get the list of report question
   * @returns The list of report question
   */
  public getListReportQuestion():Observable<ReportQuestionDto[]> {
    return this.http.get<ReportQuestionDto[]>(`${this.configurationService.apiUrl}report-question`);
  }

  /**
   * Create the report question
   * A toast is automatically showed to the user when the api call is done.
   * @param reportQuestion: report question
   * @returns A response message if successfull, else return an error.
   */
  public createReportQuestion(reportQuestion: ReportQuestionDto):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}report-question/create`, reportQuestion);
  }
}