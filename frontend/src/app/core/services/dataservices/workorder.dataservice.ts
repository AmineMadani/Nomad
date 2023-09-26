import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MapFeature } from '../../models/map-feature.model';
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

  /**
   * Get list of workorders on MapFeature format
   * @param key
   * @param limit
   * @param offset
   * @param search
   * @returns an observable of the list of map features
   */
  public getFeaturePagination(
    key: string,
    limit: number,
    offset: number,
    search: Map<string, string[]> | undefined
  ): Observable<MapFeature[]> {
    return this.http.post<MapFeature[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/${key}/pagination/${limit}/${offset}`,
      this.utilsService.mapToJson(search),
      this.httpOptions
    );
  }

  public getTasksPaginated(
    limit: number,
    offset: number,
    searchParams: any
  ): Observable<Task[]> {
    return this.http.post<Task[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/task/pagination/${limit}/${offset}`,
      searchParams,
      this.httpOptions
    );
  }

  /**
   * Create a workorder
   * @param workorder The workorder to create
   * @returns
   */
  public createWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.http.post<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/create`,
      workorder,
      this.httpOptions
    );
  }

  /**
   * Update a workorder
   * @param workorder The workorder to update
   * @returns
   */
  public updateWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${workorder.id}/update`,
      workorder,
      this.httpOptions
    );
  }

  /**
   * Terminate a workorder
   * @param workorder The workorder to terminate
   * @returns
   */
  public terminateWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${workorder.id}/terminate`,
      workorder,
      this.httpOptions
    );
  }

  /**
   * Cancel a workorder
   * @param cancelWko : input with workorder id and cancelation reason
   * @returns
   */
  public cancelWorkOrder(cancelWko: CancelWorkOrder): Observable<Workorder> {
    return this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${cancelWko.id}/cancel`,
      cancelWko,
      this.httpOptions
    );
  }

  /**
   * Cancel a task
   * @param cancelTsk : input with workorder id, task id and cancelation reason
   * @returns
   */
  public cancelTask(cancelTsk: CancelTask): Observable<Workorder> {
    return this.http.put<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${cancelTsk.id}/task/${cancelTsk.tskId}/cancel`,
      cancelTsk,
      this.httpOptions
    );
  }

  /**
   * Get a workorder
   * @returns an observable of the workorder
   */
  public getWorkorderById(id: number): Observable<Workorder> {
    return this.http.get<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorders/${id}`
    );
  }

  /**
   * Get list of workorders for a given asset
   * @returns an observable of the list of workorders
   */
  public getEquipmentWorkOrderHistory(
    assetTable: string,
    assetId: string
  ): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(
      `${this.configurationService.apiUrl}layers/${assetTable}/equipments/${assetId}/history`
    );
  }

  /**
   * Get list of workorders task status
   * @returns an observable of the list of status
   */
  public getAllWorkorderTaskStatus(): Observable<WorkorderTaskStatus[]> {
    return this.http.get<WorkorderTaskStatus[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/tasks/status`
    );
  }

  /**
   * Get list of workorders task reasons
   * @returns an observable of the list of reasons
   */
  public getAllWorkorderTaskReasons(): Observable<WorkorderTaskReason[]> {
    return this.http.get<WorkorderTaskReason[]>(
      `${this.configurationService.apiUrl}exploitation/workorders/tasks/reasons`
    );
  }
}
