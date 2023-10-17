import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { UtilsService } from '../utils.service';
import { CancelTask, CancelWorkOrder, Task, Workorder, WorkorderTaskReason, WorkorderTaskStatus } from '../../models/workorder.model';

@Injectable({
  providedIn: 'root',
})
export class WorkorderDataService {
  constructor(
    private configurationService: ConfigurationService,
    private http: HttpClient,
    private utilsService: UtilsService
  ) {}

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  public getTasksPaginated(
    limit: number,
    offset: number,
    searchParams: any
  ): Promise<Task[]> {
    return firstValueFrom(
      this.http.post<Task[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/task/pagination/${limit}/${offset}`,
      searchParams,
      this.httpOptions
      )
    );
  }

  /**
   * Create a workorder
   * @param workorder The workorder to create
   * @returns
   */
  public createWorkOrder(workorder: Workorder): Promise<Workorder> {
    return firstValueFrom(
      this.http.post<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/create`,
      workorder,
      this.httpOptions
      )
    );
  }

  /**
   * Update a workorder
   * @param workorder The workorder to update
   * @returns
   */
  public updateWorkOrder(workorder: Workorder): Promise<Workorder> {
    return firstValueFrom(
      this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${workorder.id}/update`,
      workorder,
      this.httpOptions
      )
    );
  }

  /**
   * Terminate a workorder
   * @param workorder The workorder to terminate
   * @returns
   */
  public terminateWorkOrder(workorder: Workorder): Promise<Workorder> {
    return firstValueFrom(
      this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${workorder.id}/terminate`,
      workorder,
      this.httpOptions
      )
    );
  }

  /**
   * Cancel a workorder
   * @param cancelWko : input with workorder id and cancelation reason
   * @returns
   */
  public cancelWorkOrder(cancelWko: CancelWorkOrder): Promise<Workorder> {
    return firstValueFrom(
      this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${cancelWko.id}/cancel`,
      cancelWko,
      this.httpOptions
      )
    );
  }

  /**
   * Cancel a task
   * @param cancelTsk : input with workorder id, task id and cancelation reason
   * @returns
   */
  public cancelTask(cancelTsk: CancelTask): Promise<Workorder> {
    return firstValueFrom(
      this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${cancelTsk.id}/task/${cancelTsk.tskId}/cancel`,
      cancelTsk,
      this.httpOptions
      )
    );
  }

  /**
   * Get a workorder
   * @returns an observable of the workorder
   */
  public getWorkorderById(id: number): Promise<Workorder> {
    return firstValueFrom(
      this.http.get<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${id}`
      )
    );
  }

  /**
   * Get list of workorders for a given asset
   * @returns an observable of the list of workorders
   */
  public getEquipmentWorkOrderHistory(
    assetTable: string,
    assetId: string
  ): Promise<Workorder[]> {
    return firstValueFrom(
      this.http.get<Workorder[]>(
        `${this.configurationService.apiUrl}layers/${assetTable}/equipments/${assetId}/history`
      )
    );
  }

  /**
   * Get list of workorders task status
   * @returns an observable of the list of status
   */
  public getAllWorkorderTaskStatus(): Promise<WorkorderTaskStatus[]> {
    return firstValueFrom(
      this.http.get<WorkorderTaskStatus[]>(
        `${this.configurationService.apiUrl}exploitation/workorders/tasks/status`
      )
    );
  }

  /**
   * Get list of workorders task reasons
   * @returns an observable of the list of reasons
   */
  public getAllWorkorderTaskReasons(): Promise<WorkorderTaskReason[]> {
    return firstValueFrom(
      this.http.get<WorkorderTaskReason[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/tasks/reasons`
      )
    );
  }
}
