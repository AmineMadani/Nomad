import { Injectable } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, timeout } from 'rxjs';
import { AppDB } from '../models/app-db.model';
import { WorkorderDataService } from './dataservices/workorder.dataservice';
import { CancelWorkOrder, Task, Workorder, WorkorderTaskReason, WorkorderTaskStatus } from '../models/workorder.model';
import { ConfigurationService } from './configuration.service';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { UtilsService } from './utils.service';
import { MapFeature } from '../models/map-feature.model';

@Injectable({
  providedIn: 'root',
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
    let workorder: Workorder = (await this.db.workorders.get(id.toString()))
      ?.data;
    if (!workorder) {
      if (!this.utilsService.isMobilePlateform()) {
        return firstValueFrom(this.workorderDataService.getWorkorderById(id));
      }
      return firstValueFrom(
        this.workorderDataService.getWorkorderById(id).pipe(
          timeout(this.configurationService.offlineTimeout),
          catchError(async (error) => {
            if (error?.name == 'TimeoutError') {
              let featureWorkorder =
                await this.cacheService.getFeatureByLayerAndFeatureId(
                  'task',
                  id.toString()
                );
              if (featureWorkorder) {
                workorder = this.buildWorkorderFromGeojson(featureWorkorder);
                let tasks = await this.cacheService.getFeatureByLayerAndProperty('task', 'wkoId', featureWorkorder.properties['wkoId'].toString());
                for (let task of tasks) {
                  workorder.tasks.push(this.buildTaskFromGeojson(task));
                }
                return workorder;
              }
            }
            throw error;
          })
        )
      );
    }
    return workorder;
  }

  public async getLocalWorkorders(): Promise<Workorder[]> {
    let workorders: Workorder[] = (await this.db.workorders.toArray()).map(elem => elem.data);
    return workorders; 
  }

  /**
   * Get workorder with pagination
   * @param key The layer key
   * @param limit The limit
   * @param offset The offset
   * @param search The search parameters
   * @returns the list of features
   */
  public getFeaturePagination(
    key: string,
    limit: number,
    offset: number,
    search: Map<string, string[]> | undefined
  ): Observable<MapFeature[]> {
    return this.workorderDataService
      .getFeaturePagination(key, limit, offset, search)
      .pipe(map((fs: any[]) => fs.map((f) => MapFeature.from(f))));
  }

  /**
   * Update workorder
   * @param workorder the workorder to update
   * @returns the workorder
   */
  public updateWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.workorderDataService.updateWorkOrder(workorder);
  }

  /**
   * Terminate a workorder
   * @param workorder the workorder to terminate
   * @returns the workorder
   */
  public terminateWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.workorderDataService.terminateWorkOrder(workorder);
  }

  /**
   * Create a workorder
   * @param workorder the workorder to create
   * @returns the workorder
   */
  public createWorkOrder(workorder: Workorder): Observable<Workorder> {
    return this.workorderDataService.createWorkOrder(workorder);
  }

  /**
   * Save last state of a workorder
   * @param workorder the workorder state
   */
  public async saveStateWorkorder(workorder: Workorder) {
    await this.db.workorders.put(
      { data: workorder, key: workorder.id.toString() },
      workorder.id.toString()
    );
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
  public getEquipmentWorkOrderHistory(
    assetTable: string,
    assetId: string
  ): Observable<Workorder[]> {
    return this.workorderDataService.getEquipmentWorkOrderHistory(
      assetTable,
      assetId
    );
  }

  public cancelWorkorder(
    cancelPayload: CancelWorkOrder
  ): Observable<Workorder> {
    return this.workorderDataService.cancelWorkOrder(cancelPayload);
  }

  /**
   * Get list of workorders task status
   * @returns an observable of the list of status
   */
  public getAllWorkorderTaskStatus(): Observable<WorkorderTaskStatus[]> {
    return this.cacheService.fetchReferentialsData<WorkorderTaskStatus[]>(
      ReferentialCacheKey.WORKORDER_TASK_STATUS,
      () => this.workorderDataService.getAllWorkorderTaskStatus()
    );
  }

  /**
   * Get list of workorders task reasons
   * @returns an observable of the list of reasons
   */
  public getAllWorkorderTaskReasons(): Observable<WorkorderTaskReason[]> {
    return this.cacheService.fetchReferentialsData<WorkorderTaskReason[]>(
      ReferentialCacheKey.WORKORDER_TASK_REASON,
      () => this.workorderDataService.getAllWorkorderTaskReasons()
    );
  }

  private buildWorkorderFromGeojson(featureWorkorder: any): Workorder {
    return {
      id: featureWorkorder.properties['id'],
      latitude: featureWorkorder.properties['y'],
      longitude: featureWorkorder.properties['x'],
      wkoAddress: featureWorkorder.properties['wkoAddress'],
      wkoAgentNb: featureWorkorder.properties['wkoAgentNb'],
      wkoEmergency: featureWorkorder.properties['wkoEmergency'],
      wkoAppointment: featureWorkorder.properties['wkoAppointment'],
      wkoName: featureWorkorder.properties['wkoName'],
      wkoCompletionDate: featureWorkorder.properties['wkoCompletionDate'],
      wkoPlanningEndDate: featureWorkorder.properties['wkoPlanningEndDate'],
      wkoPlanningStartDate: featureWorkorder.properties['wkoPlanningStartDate'],
      wtsId: featureWorkorder.properties['wkoWtsId'],
      wkoCreationComment : featureWorkorder.properties['wkoCreationComment'],
      tasks: [],
      ctyId: featureWorkorder.properties['ctyId'],
      ctrId: '',
      wkoAttachment: featureWorkorder.properties['wkoAttachment'],
      wkoExtToSync: featureWorkorder.properties['wkoExtSoSync'],
    };
  }

  private buildTaskFromGeojson(task: any): Task {
    return {
      assObjRef: task.properties['assObjRef'],
      assObjTable: task.properties['assObjTable'],
      id: task.properties['id'],
      ctrId: task.properties['ctrId'],
      latitude: task.properties['y'],
      longitude: task.properties['x'],
      tskReportDate: task.properties['tskReportDate'],
      wtrId: task.properties['wtrId'],
      wtsId: task.properties['wtsId'],
      wkoId: task.properties['wkoId']
    };
  }
}
