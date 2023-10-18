import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, firstValueFrom, forkJoin, interval, map, of, switchMap, takeUntil, tap, timeout } from 'rxjs';
import { WorkorderDataService } from './dataservices/workorder.dataservice';
import { CancelTask, CancelWorkOrder, Task, Workorder, WorkorderTaskReason, WorkorderTaskStatus, buildTaskFromGeojson, buildWorkorderFromGeojson, convertTasksToWorkorders } from '../models/workorder.model';
import { ConfigurationService } from './configuration.service';
import { CacheKey, CacheService, ReferentialCacheKey } from './cache.service';
import { MapFeature } from '../models/map-feature.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MapService } from './map/map.service';
import { AppDB } from '../models/app-db.model';
import { AttachmentService } from './attachment.service';
import { UtilsService } from './utils.service';

export enum SyncOperations {
  CreateWorkorder = 'createWorkOrder',
  UpdateWorkorder = 'updateWorkOrder',
  TerminateWorkorder = 'terminateWorkOrder',
}

@Injectable({
  providedIn: 'root',
})
export class WorkorderService {

  public activeWorkorderSwitch:boolean = false;
  public dateWorkorderSwitch: Date = null;

  constructor(
    private workorderDataService: WorkorderDataService,
    private cacheService: CacheService,
    private configurationService: ConfigurationService,
    private mapService: MapService,
    private attachmentService: AttachmentService,
    private utilsService: UtilsService
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  private workorderTaskReasons: WorkorderTaskReason[];
  private workorderTaskStatus: WorkorderTaskStatus[];

  private stopSyncOperations$: Subject<void> = new Subject<void>();
  private syncOperations = {
    createWorkOrder: (workorder: Workorder) => this.workorderDataService.createWorkOrder(workorder),
    updateWorkOrder: (workorder: Workorder) => this.workorderDataService.updateWorkOrder(workorder),
    terminateWorkOrder: (workorder: Workorder) => this.workorderDataService.terminateWorkOrder(workorder),
  };

  /**
   * Get the wanted workorder.
   * If the workorder last state is not found in local storage,
   * get the workorder from the server
   * if the server no respond in the timebox then the workorder if construct from the geojson.
   * @returns A Promise that resolves to the referential
   */
  async getWorkorderById(id: number): Promise<Workorder> {
    const localWorkorders: Workorder[] = await this.getLocalWorkorders();
    const workOrder = localWorkorders.find(wko => wko.id.toString() === id.toString());
    if (workOrder) {
      return workOrder;
    }

    return this.utilsService.fetchPromiseWithTimeout({
      fetchPromise: this.workorderDataService.getWorkorderById(id),
      timeout: this.configurationService.offlineTimeoutWorkorder
    }).catch(async (error) => {
      const featureTask = await this.cacheService.getFeatureByLayerAndFeatureId('task', id.toString());
      if (featureTask) {
        const workorder = buildWorkorderFromGeojson(featureTask);
        const tasks = await this.cacheService.getFeatureByLayerAndProperty('task', 'wkoId', featureTask.properties['wkoId'].toString());
        for (const task of tasks) {
          workorder.tasks.push(buildTaskFromGeojson(task));
        }
        return workorder;
      }

      throw error;
    });
  }

  public async getLocalWorkorders(): Promise<Workorder[]> {
    return (await this.db.workorders.toArray()).map(elem => elem.data);
  }

  public async getLocalWorkordersToSync(): Promise<Workorder[]> {
    const workorders = await this.getLocalWorkorders();
    // For the moment, we manage only existing workorders
    return workorders.filter((wko) => wko?.syncOperation && wko?.id);
  }

  public getTasksPaginated(
    limit: number,
    offset: number,
    search: any
  ): Promise<Task[]> {
    return this.utilsService.fetchPromiseWithTimeout({
      fetchPromise: this.workorderDataService.getTasksPaginated(limit, offset, search),
      timeout: this.configurationService.offlineTimeoutWorkorder
    }).catch(async (error) => {
      const isCacheDownload: boolean = await this.cacheService.isCacheDownload(CacheKey.WORKORDERS);
      if (isCacheDownload) {
        const featureTasks: any[] = await this.cacheService.getPaginatedFeaturesByLayer('task', offset, limit);

        return this.filterFeaturesTasks(featureTasks, search);
      }

      throw error;
    });
  }

  public filterFeaturesTasks(featureTasks: any[], search: any): Task[] {
    const workorders: Workorder[] = convertTasksToWorkorders(featureTasks);

    const result = workorders
      .filter(workorders => {
        const tasksMatch = workorders.tasks.some(task => (search.wtrIds === undefined || search.wtrIds.length === 0 || search.wtrIds.includes(task.wtrId)) &&
          (search.assObjTables === undefined || search.assObjTables.length === 0 || search.assObjTables.includes(task.assObjTable))
        );
        return (
          (search.wtrIds === undefined || search.wtsIds.length === 0 || search.wtsIds.includes(workorders.wtsId)) &&
          (search.wkoAppointment === null || workorders.wkoAppointment === search.wkoAppointment) &&
          (search.wkoEmergeny === null || workorders.wkoEmergency === search.wkoEmergeny) &&
          (workorders.wkoPlanningStartDate >= search.wkoPlanningStartDate) &&
          (search.wkoPlanningEndDate === null || workorders.wkoPlanningStartDate <= search.wkoPlanningEndDate) &&
          tasksMatch
        );
      })
      .flatMap(workorder => {
        return workorder.tasks.map(task => ({
          id: task.id,
          wkoId: workorder.id,
          wkoName: workorder.wkoName,
          wkoEmergency: workorder.wkoEmergency,
          wkoAppointment: workorder.wkoAppointment,
          ctyId: workorder.ctyId,
          ctrId: task.ctrId,
          wkoAddress: workorder.wkoAddress,
          wkoPlanningStartDate: workorder.wkoPlanningStartDate,
          wkoPlanningEndDate: workorder.wkoPlanningEndDate,
          wtsId: workorder.wtsId,
          wtrId: task.wtrId,
          wkoCompletionStartDate: workorder.wkoCompletionStartDate,
          wkoCompletionEndDate: workorder.wkoCompletionEndDate,
          longitude: task.longitude,
          latitude: task.latitude,
          wkoAgentNb: workorder.wkoAgentNb,
          wkoCreationComment: workorder.wkoCreationComment,
          assObjTable: task.assObjTable
        }));
      });
    return result;
  }

  /**
   * Update workorder
   * @param workorder the workorder to update
   * @returns the workorder
   */
  public updateWorkOrder(workorder: Workorder): Promise<Workorder> {
    workorder.syncOperation = undefined;

    return this.utilsService.fetchPromiseWithTimeout({
      fetchPromise: this.workorderDataService.updateWorkOrder(workorder),
      timeout: this.configurationService.offlineTimeoutWorkorder
    })
      .then(async (newWko: Workorder) => {
        // Save the workorder attachments if necessary
        await this.attachmentService.saveLocalAttachmentsByCacheIdAndObjId(workorder.id, newWko.id);
        return newWko;
      })
      .catch((error) => this.handleConnectionErrorOnWorkorderOperations(error, workorder, SyncOperations.UpdateWorkorder));
  }

  /**
   * Terminate a workorder
   * @param workorder the workorder to terminate
   * @returns the workorder
   */
  public terminateWorkOrder(workorder: Workorder): Promise<Workorder> {
    return this.workorderDataService.terminateWorkOrder(workorder);
  }

  /**
   * Create a workorder
   * @param workorder the workorder to create
   * @returns the workorder
   */
  public createWorkOrder(workorder: Workorder): Promise<Workorder> {
    workorder.syncOperation = undefined;

    return this.utilsService.fetchPromiseWithTimeout({
      fetchPromise: this.workorderDataService.createWorkOrder(workorder),
      timeout: this.configurationService.offlineTimeoutWorkorder
    })
      .then(async (newWko: Workorder) => {
        // Save the workorder attachments if necessary
        await this.attachmentService.saveLocalAttachmentsByCacheIdAndObjId(workorder.id, newWko.id);
        return newWko;
      })
      .catch(async (error) => {
        if (error?.name == 'TimeoutError') {
          workorder.syncOperation = SyncOperations.CreateWorkorder;
          workorder.isDraft = false;
          this.saveCacheWorkorder(workorder);
          return workorder;
        }
        throw error
      });
  }

  /**
   * Cancel a workorder
   * @param workorder the workorder to cancel
   * @returns the workorder
   */
  public cancelWorkorder(
    cancelPayload: CancelWorkOrder
  ): Promise<Workorder> {
    return this.workorderDataService.cancelWorkOrder(cancelPayload);
  }

  /**
   * Cancel a task
   * @param cancelPayload the payload to cancel the task
   * @returns the workorder
   */
    public cancelTask(
      cancelPayload: CancelTask
    ): Promise<Workorder> {
      return this.workorderDataService.cancelTask(cancelPayload);
    }

  /**
   * Save last state of a workorder
   * @param workorder the workorder state
   */
  public async saveCacheWorkorder(workorder: Workorder) {
    await this.db.workorders.put(
      { data: workorder, key: workorder.id.toString() },
      workorder.id.toString()
    );
  }

  /**
   * Delete state of a workorder
   * @param workorder the workorder state
   */
  public async deleteCacheWorkorder(workorder: Workorder) {
    // Check undefined and null, to pass in the if statements, even if the number is negative
    if (workorder.id !== undefined && workorder.id !== null) {
      await this.db.workorders.delete(workorder.id.toString());
    }
  }

  /**
   * Get list of workorders for a given asset
   * @returns an observable of the list of workorders
   */
  public getEquipmentWorkOrderHistory(
    assetTable: string,
    assetId: string
  ): Promise<Workorder[]> {
    return this.workorderDataService.getEquipmentWorkorderHistory(
      assetTable,
      assetId
    );
  }

  /**
   * Get list of workorders task status
   * @returns an observable of the list of status
   */
  public async getAllWorkorderTaskStatus(forceGetFromDb: boolean = false): Promise<WorkorderTaskStatus[]> {
    if (!this.workorderTaskStatus || forceGetFromDb) {
      this.workorderTaskStatus = await this.cacheService.fetchReferentialsData<WorkorderTaskStatus[]>(
        ReferentialCacheKey.WORKORDER_TASK_STATUS,
        () => this.workorderDataService.getAllWorkorderTaskStatus()
      )
    }

    return this.workorderTaskStatus;
  }

  /**
   * Get list of workorders task reasons
   * @returns an observable of the list of reasons
   */
  public async getAllWorkorderTaskReasons(forceGetFromDb: boolean = false): Promise<WorkorderTaskReason[]> {
    if (!this.workorderTaskReasons || forceGetFromDb) {
      this.workorderTaskReasons = await this.cacheService.fetchReferentialsData<WorkorderTaskReason[]>(
        ReferentialCacheKey.WORKORDER_TASK_REASON,
        () => this.workorderDataService.getAllWorkorderTaskReasons()
      )
    }

    return this.workorderTaskReasons;
  }

  /**
   * This method remove the drafts workorders if not exist in url
   * @param url url
   */
  public removeLocalUnusedWorkorderFromUrl(url: string) {
    this.getLocalWorkorders().then(workorders => {
      for (let workorder of workorders) {
        if (workorder.isDraft && !url.includes(workorder.id.toString())) {
          this.deleteCacheWorkorder(workorder);
        }
      }
    });
  }

  /**
    * Handles connection errors by caching the workorder and initiating a periodic sync.
    *
    * If there is a slow connection or no connection at all, this method will
    * cache the workorder and initiate a periodic synchronization of workorders.
    *
    * @param error - The error object representing the connection error.
    * @param workorder - The workorder object to be cached.
    * @returns The cached workorder object.
  */
  public async handleConnectionErrorOnWorkorderOperations(error: Error, workorder: Workorder, syncOperations: SyncOperations): Promise<Workorder> {
    if (error.name === 'TimeoutError' || (error instanceof HttpErrorResponse && !navigator.onLine)) {
      workorder.syncOperation = syncOperations;
      await this.saveCacheWorkorder(workorder);
      await this.startPeriodicSyncWorkorders();

      return workorder;
    }

    throw error;
  }


  /**
    * Launches periodic synchronization of local workorders with the server every 10 seconds.
    *
    * This method retrieves local workorders that need synchronization and
    * performs the synchronization in parallel. If a workorder is successfully
    * synchronized, it is deleted from the local cache.
    *
    * The synchronization interval stops when there are no more workorders to sync
    * or when an error occurs during the synchronization.
  */
  public async startPeriodicSyncWorkorders() {
    const workordersToSync = await this.getLocalWorkordersToSync();
    // Start the periodic listening only if there are workorders to sync
    if (workordersToSync.length > 0) {
      // Stop the previous synchronization if it is still running
      this.stopSyncOperations$.next();
      this.stopSyncOperations$.complete();

      // Instantiate a new Subject for stopping the upcoming synchronization
      this.stopSyncOperations$ = new Subject<void>();

      // Listen changes every 5 minutes
      interval(10000).pipe(
        // Stop the interval when there are no more workorders to sync
        takeUntil(this.stopSyncOperations$),
        // Perform the synchronization
        switchMap(() => {
          // Create an array of observables to perform the synchronization
          const syncsToPerform: Promise<any>[] = workordersToSync.map(
            (wko) => {
              // Get the right function to perform the synchronization
              return this.syncOperations[wko.syncOperation](wko).then((workorder) => {
                  // If the synchronization is successful, delete the workorder from the cache
                  console.log('Workorder updated successfully', workorder);
                  this.deleteCacheWorkorder(wko);
                  this.syncWorkorderDisplay(wko, workorder);
                });
            }
          );

          // Perform in parallel the synchronization of all workorders
          // and stop the interval when all workorders are synchronized
          return Promise.all(syncsToPerform)
            .then(() => {
              this.stopSyncOperations$.next();
              this.stopSyncOperations$.complete();
            })
            .catch((error) => {
              console.error('Failed to perform the synchronization', error);
              return EMPTY;
            });
        })
      ).subscribe();
    }
  }

  private syncWorkorderDisplay(oldWko: Workorder, wko: Workorder) {
    if(this.mapService.getMap()) {
      if(this.mapService.getLayer('task')) {
        for(let oldTask of oldWko.tasks) {
          this.mapService.removePoint('task',oldTask.id.toString());
        }
        this.mapService.addGeojsonToLayer(wko, 'task');
      }
    }
  }
}
