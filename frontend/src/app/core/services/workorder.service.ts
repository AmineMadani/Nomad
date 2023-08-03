import { Injectable } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, timeout } from 'rxjs';
import { AppDB } from '../models/app-db.model';
import { WorkorderDataService } from './dataservices/workorder.dataservice';
import { CancelWorkOrder, Task, Workorder } from '../models/workorder.model';
import { ConfigurationService } from './configuration.service';
import { CacheService } from './cache.service';
import { UtilsService } from './utils.service';
import { MapFeature } from '../models/map-feature.model';

@Injectable({
  providedIn: 'root'
})
export class WorkorderService {

  private db: AppDB;

  constructor(
    private workorderDataService: WorkorderDataService,
    private cacheService: CacheService,
    private configurationService: ConfigurationService,
    private utilsService: UtilsService
  ) {
    this.db = new AppDB();
  }

  /**
   * Get the wanted workorder.
   * If the workorder last state is not found in local storage, 
   * get the workorder from the server
   * if the server no respond in the timebox then the workorder if construct from the geojson.
   * @returns A Promise that resolves to the referential
   */
  async getWorkorderById(id: number): Promise<Workorder> {
    let workorder: Workorder = (await this.db.workorders.get(id.toString()))?.data;
    if (!workorder) {
      if (!this.utilsService.isMobilePlateform()) {
        return firstValueFrom(this.workorderDataService.getWorkorderById(id));
      }
      return firstValueFrom(this.workorderDataService.getWorkorderById(id)
        .pipe(
          timeout(this.configurationService.offlineTimeout),
          catchError(async (error) => {
            if (error?.name == 'TimeoutError') {
              let featureWorkorder = await this.cacheService.getFeatureByLayerAndFeatureId('task', id.toString());
              if (featureWorkorder) {
                workorder = this.buildWorkorderFromGeojson(featureWorkorder);
                let tasks = await this.cacheService.getFeatureByLayerAndProperty('task', 'wko_id', featureWorkorder.properties['wko_id'].toString());
                for (let task of tasks) {
                  workorder.tasks.push(this.buildTaskFromGeojson(task))
                }
                return workorder;
              }
            }
            throw error;
          })
        )
      )
    };
    return workorder;
  }

  /**
   * Get workorder with pagination
   * @param key The layer key
   * @param limit The limit
   * @param offset The offset
   * @param search The search parameters
   * @returns the list of features
   */
  public getFeaturePagination(key: string, limit: number, offset: number, search: Map<string, string[]> | undefined): Observable<MapFeature[]> {
    return this.workorderDataService.getFeaturePagination(key, limit, offset, search)
      .pipe(map((fs: any[]) => fs.map((f) => MapFeature.from(f))));
  }

  /**
   * Update a workorder
   * @param workorder the workorder to update
   * @returns the workorder
   */
  public updateWorkOrder(workorder: Workorder): Observable<any> {
    return this.workorderDataService.updateWorkOrder(workorder);
  }

  /**
   * Create a workorder
   * @param workorder the workorder to create
   * @returns the workorder
   */
  public createWorkOrder(workorder: Workorder): Observable<any> {
    return this.workorderDataService.createWorkOrder(workorder);
  }

  /**
   * Save last state of a workorder
   * @param workorder the workorder state
   */
  public async saveStateWorkorder(workorder: Workorder) {
    await this.db.workorders.put({ data: workorder, key: workorder.id.toString() }, workorder.id.toString());
  }

  /**
   * Delete state of a workorder
   * @param workorder the workorder state
   */
  public async deleteStateWorkorder(workorder: Workorder) {
    await this.db.workorders.delete(workorder.id.toString());
  }

  /**
   * Get list of workorders for a given asset
   * @returns an observable of the list of workorders
   */
  public getEquipmentWorkOrderHistory(assetTable: string, assetId: string
  ): Observable<Workorder[]> {
    return this.workorderDataService.getEquipmentWorkOrderHistory(assetTable, assetId);
  }

  public cancelWorkorder(cancelPayload: CancelWorkOrder): Observable<any> {
    return this.workorderDataService.cancelWorkOrder(cancelPayload);
  }

  private buildWorkorderFromGeojson(featureWorkorder: any): Workorder {
    return {
      id: featureWorkorder.properties['id'],
      latitude: featureWorkorder.properties['y'],
      longitude: featureWorkorder.properties['x'],
      wkoAddress: featureWorkorder.properties['wko_adress'],
      wkoAgentNb: featureWorkorder.properties['wko_agent_nb'],
      wkoEmergency: featureWorkorder.properties['wko_emergency'],
      wkoAppointment: featureWorkorder.properties['wko_appointment'],
      wkoName: featureWorkorder.properties['wko_name'],
      wkoCompletionDate: featureWorkorder.properties['wko_completion_date'],
      wkoPlanningEndDate: featureWorkorder.properties['wko_planning_end_date'],
      wkoPlanningStartDate: featureWorkorder.properties['wko_planning_start_date'],
      wtsId: featureWorkorder.properties['wko_wts_id'],
      tasks: []
    };
  }

  private buildTaskFromGeojson(task: any): Task {
    return {
      assObjRef: task.properties['ass_obj_ref'],
      assObjTable: task.properties['ass_obj_table'],
      id: task.properties['id'],
      ctrId: task.properties['ctr_id'],
      latitude: task.properties['y'],
      longitude: task.properties['x'],
      tskReportDate: task.properties['tsk_report_date'],
      wtrId: task.properties['wtr_id'],
      wtsId: task.properties['wts_id'],
      wkoId: task.properties['wko_id']
    };
  }
}
