import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportQuestionDataService } from './dataservices/reportQuestion.dataservice';
import { ReportQuestionDto } from '../models/reportQuestion.model';

@Injectable({
  providedIn: 'root'
})
export class ReportQuestionService {

  constructor(
    private reportQuestionDataService: ReportQuestionDataService,
  ) {
  }

  /**
   * Get the list of report question
   * @returns the list of report question
   */
  public getListReportQuestion(): Observable<any> {
    return this.reportQuestionDataService.getListReportQuestion();
  }

  /**
   * Create a report question
   * @param reportQuestion the report question
   * @returns the report question
   */
  public createAssetForSig(reportQuestion: ReportQuestionDto): Observable<any> {
    return this.reportQuestionDataService.createReportQuestion(reportQuestion);
  }
}