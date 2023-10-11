import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ReportQuestionDataService } from './dataservices/reportQuestion.dataservice';
import { ReportQuestionDto } from '../models/reportQuestion.model';
import { ApiSuccessResponse } from '../models/api-response.model';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class ReportQuestionService {

  constructor(
    private reportQuestionDataService: ReportQuestionDataService,
    private utilsService: UtilsService,
  ) {
  }

  /**
   * Get the list of report question
   * @returns the list of report question
   */
  public getListReportQuestion(): Observable<ReportQuestionDto[]> {
    return this.reportQuestionDataService.getListReportQuestion();
  }

  /**
   * Get the a report question by its id
   * @returns the report question
   */
  public getReportQuestionById(id: number): Observable<ReportQuestionDto> {
    return this.reportQuestionDataService.getReportQuestionById(id);
  }

  /**
   * Create a report question
   * @param reportQuestion the report question
   * @returns the id of the created report question
   */
  public createReportQuestion(reportQuestion: ReportQuestionDto): Observable<ApiSuccessResponse> {
    return this.reportQuestionDataService.createReportQuestion(reportQuestion).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Update a report question
   * @param reportQuestion the report question
   * @returns the id of the updated report question
   */
  public updateReportQuestion(reportQuestion: ReportQuestionDto): Observable<ApiSuccessResponse> {
    return this.reportQuestionDataService.updateReportQuestion(reportQuestion).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Delete a report question
   * @param listId the list of id of report questions to delete
   */
  public deleteListReportQuestion(listId: number[]): Observable<ApiSuccessResponse> {
    return this.reportQuestionDataService.deleteListReportQuestion(listId).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }
}