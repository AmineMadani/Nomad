import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MapFeature } from '../../models/map-feature.model';
import { ConfigurationService } from '../configuration.service';
import { UtilsService } from '../utils.service';
import { CancelWorkOrder, Workorder } from '../../models/workorder.model';

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
  public getFeaturePagination(key: string,limit: number,offset: number,search: Map<string, string[]> | undefined): Observable<MapFeature[]> {
    return this.http
      .post<MapFeature[]>(`${this.configurationService.apiUrl}exploitation/workorders/${key}/pagination/${limit}/${offset}`,
        this.utilsService.mapToJson(search),
        this.httpOptions
      )
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
  public getEquipmentWorkOrderHistory(assetTable: string, assetId: string): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(
      `${this.configurationService.apiUrl}layers/${assetTable}/equipments/${assetId}/history`
    );
  }
}
