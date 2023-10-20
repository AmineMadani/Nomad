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
  public getListReportQuestion(): Promise<ReportQuestionDto[]> {
    return this.reportQuestionDataService.getListReportQuestion();
  }

  /**
   * Get the a report question by its id
   * @returns the report question
   */
  public getReportQuestionById(id: number): Promise<ReportQuestionDto> {
    return this.reportQuestionDataService.getReportQuestionById(id);
  }

  /**
   * Create a report question
   * @param reportQuestion the report question
   * @returns the id of the created report question
   */
  public async createReportQuestion(reportQuestion: ReportQuestionDto): Promise<ApiSuccessResponse> {
    const response = await this.reportQuestionDataService.createReportQuestion(reportQuestion);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Update a report question
   * @param reportQuestion the report question
   * @returns the id of the updated report question
   */
  public async updateReportQuestion(reportQuestion: ReportQuestionDto): Promise<ApiSuccessResponse> {
    const response = await this.reportQuestionDataService.updateReportQuestion(reportQuestion);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Delete a report question
   * @param listId the list of id of report questions to delete
   */
  public async deleteListReportQuestion(listId: number[]): Promise<ApiSuccessResponse> {
    const response = await this.reportQuestionDataService.deleteListReportQuestion(listId)

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }
}
