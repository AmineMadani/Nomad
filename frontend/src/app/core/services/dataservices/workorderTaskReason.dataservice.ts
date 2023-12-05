import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { firstValueFrom } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { ReportQuestionDto } from '../../models/reportQuestion.model';
import { WorkorderTaskReasonDto } from '../../models/workorderTaskReason.model';

@Injectable({
  providedIn: 'root',
})
export class WorkorderTaskReasonDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {
  }

  /**
   * Create the workorder task reason
   * A toast is automatically showed to the user when the api call is done.
   * @param wtr: workorder task reason
   * @returns A response message if successfull, else return an error.
   */
  public createWorkorderTaskReason(wtr: WorkorderTaskReasonDto): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}workorder-task-reason/create`, wtr)
    );
  }

  /**
   * Update the workorder task reason
   * A toast is automatically showed to the user when the api call is done.
   * @param wtr: workorder task reason
   * @returns A response message if successfull, else return an error.
   */
  public updateWorkorderTaskReason(wtr: WorkorderTaskReasonDto): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}workorder-task-reason/update`, wtr)
    );
  }
}
