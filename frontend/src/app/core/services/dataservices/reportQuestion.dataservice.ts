import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable, firstValueFrom } from 'rxjs';
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
  public getListReportQuestion(): Promise<ReportQuestionDto[]> {
    return firstValueFrom(
      this.http.get<ReportQuestionDto[]>(`${this.configurationService.apiUrl}report-question`)
    );
  }

  /**
   * Get a report question by id
   * @returns The report question
   */
  public getReportQuestionById(id: number): Promise<ReportQuestionDto> {
    return firstValueFrom(
      this.http.get<ReportQuestionDto>(`${this.configurationService.apiUrl}report-question/${id}`)
    );
  }

  /**
   * Create the report question
   * A toast is automatically showed to the user when the api call is done.
   * @param reportQuestion: report question
   * @returns A response message if successfull, else return an error.
   */
  public createReportQuestion(reportQuestion: ReportQuestionDto): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}report-question/create`, reportQuestion)
    );
  }

  /**
   * Update the report question
   * A toast is automatically showed to the user when the api call is done.
   * @param reportQuestion: report question
   * @returns A response message if successfull, else return an error.
   */
  public updateReportQuestion(reportQuestion: ReportQuestionDto): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}report-question/update`, reportQuestion)
    );
  }

  /**
   * Delete the report question
   * A toast is automatically showed to the user when the api call is done.
   * @param listId: the list of id of report questions to delete
   * @returns A response message if successfull, else return an error.
   */
  public deleteListReportQuestion(listId: number[]): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}report-question/delete?id=${listId}`)
    );
  }
}
