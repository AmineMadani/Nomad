import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MapFeature } from '../../models/map-feature.model';
import { ConfigurationService } from '../configuration.service';
import { UtilsService } from '../utils.service';
import { Workorder } from '../../models/workorder.model';

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

  public getFeaturePagination(key: string,limit: number,offset: number,search: Map<string, string[]> | undefined): Observable<MapFeature[]> {
    return this.http
      .post<MapFeature[]>(`${this.configurationService.apiUrl}exploitation/${key}/pagination/${limit}/${offset}`,
        this.utilsService.mapToJson(search),
        this.httpOptions
      )
  }

  public createWorkOrder(workorder: Workorder): Observable<any> {
    return this.http.post<any>(
      `${this.configurationService.apiUrl}exploitation/workorder/create`,
      workorder,
      this.httpOptions
    );
  }

  public updateWorkOrder(workorder: Workorder): Observable<any> {
    return this.http.post<any>(
      `${this.configurationService.apiUrl}exploitation/workorder/update`,
      workorder,
      this.httpOptions
    );
  }

  /**
   * Get a workorder
   * @returns an observable of the workorder
   */
  public getWorkorderById(id: number): Observable<Workorder> {
    return this.http.get<Workorder>(
      `${this.configurationService.apiUrl}exploitation/workorder/${id}`
    );
  }

  /**
   * Get list of workorders for a given asset
   * @returns an observable of the list of workorders
   */
  public getEquipmentWorkOrderHistory(assetTable: string, assetId: string): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(
      `${this.configurationService.apiUrl}layer/${assetTable}/equipment/${assetId}/history`
    );
  }
}
