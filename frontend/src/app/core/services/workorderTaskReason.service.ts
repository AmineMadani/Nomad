import { Injectable } from '@angular/core';
import { ApiSuccessResponse } from '../models/api-response.model';
import { UtilsService } from './utils.service';
import { WorkorderTaskReasonDataService } from './dataservices/workorderTaskReason.dataservice';
import { WorkorderTaskReasonDto } from '../models/workorderTaskReason.model';

@Injectable({
  providedIn: 'root'
})
export class WorkorderTaskReasonService {

  constructor(
    private workorderTaskReasonDataService: WorkorderTaskReasonDataService,
    private utilsService: UtilsService,
  ) { }

  /**
   * Create a workorder task reason
   * @param wtr the workorder task reason
   * @returns a message if its ok
   */
  public async createWorkorderTaskReason(wtr: WorkorderTaskReasonDto): Promise<ApiSuccessResponse> {
    const response = await this.workorderTaskReasonDataService.createWorkorderTaskReason(wtr);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Update a workorder task reason
   * @param wtr the workorder task reason
   * @returns a message if its ok
   */
  public async updateWorkorderTaskReason(wtr: WorkorderTaskReasonDto): Promise<ApiSuccessResponse> {
    const response = await this.workorderTaskReasonDataService.updateWorkorderTaskReason(wtr);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }
}
