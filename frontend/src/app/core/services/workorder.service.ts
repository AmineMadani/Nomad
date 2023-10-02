import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, firstValueFrom, forkJoin, from, interval, map, of, switchMap, takeUntil, tap, timeout } from 'rxjs';
import { AppDB } from '../models/app-db.model';
import { WorkorderDataService } from './dataservices/workorder.dataservice';
import { CancelTask, CancelWorkOrder, Task, Workorder, WorkorderTaskReason, WorkorderTaskStatus } from '../models/workorder.model';
import { ConfigurationService } from './configuration.service';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { UtilsService } from './utils.service';
import { MapFeature } from '../models/map-feature.model';
import { HttpErrorResponse } from '@angular/common/http';

export enum SyncOperations {
  CreateWorkorder = 'createWorkOrder',
  UpdateWorkorder = 'updateWorkOrder',
  TerminateWorkorder = 'terminateWorkOrder',
}

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
    if(!this.utilsService.isMobilePlateform()) {
      return firstValueFrom(this.workorderDataService.getWorkorderById(id));;
    }
    return firstValueFrom(
      this.workorderDataService.getWorkorderById(id).pipe(
        timeout(this.configurationService.offlineTimeoutWorkorder),
          catchError(async (error) => {
            if (error?.name == 'TimeoutError') {
              let featureWorkorder =
                await this.cacheService.getFeatureByLayerAndFeatureId(
                  'task',
                  id.toString()
                );
              if (featureWorkorder) {
                let workorder = this.buildWorkorderFromGeojson(featureWorkorder);
                let tasks =
                  await this.cacheService.getFeatureByLayerAndProperty(
                    'task',
                    'wkoId',
                    featureWorkorder.properties['wkoId'].toString()
                  );
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

  public async getLocalWorkorders(): Promise<Workorder[]> {
    return (await this.db.workorders.toArray()).map(elem => elem.data);
  }

  public async getLocalWorkordersToSync(): Promise<Workorder[]> {
    const workorders = await this.getLocalWorkorders();
    // For the moment, we manage only existing workorders
    return workorders.filter((wko) => wko?.syncOperation && wko?.id);
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

  public getTasksPaginated(
    limit: number,
    offset: number,
    search: any
  ): Observable<Task[]> {
    return this.workorderDataService.getTasksPaginated(limit, offset, search);
  }

  /**
   * Update workorder
   * @param workorder the workorder to update
   * @returns the workorder
   */
  public updateWorkOrder(workorder: Workorder): Observable<Workorder> {
    workorder.syncOperation = undefined;
    return this.workorderDataService.updateWorkOrder(workorder).pipe(
      timeout(this.configurationService.offlineTimeoutWorkorder),
      catchError((error) => this.handleConnectionErrorOnWorkorderOperations(error, workorder, SyncOperations.UpdateWorkorder))
    );
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
    workorder.syncOperation = undefined;
    return this.workorderDataService.createWorkOrder(workorder).pipe(
      timeout(this.configurationService.offlineTimeoutWorkorder),
      catchError(async (error) => {
        if (error?.name == 'TimeoutError') {
          workorder.syncOperation = SyncOperations.CreateWorkorder;
          this.saveCacheWorkorder(workorder);
          return workorder;
        }
        throw error
      })
    );
  }

  /**
   * Cancel a workorder
   * @param workorder the workorder to cancel
   * @returns the workorder
   */
  public cancelWorkorder(
    cancelPayload: CancelWorkOrder
  ): Observable<Workorder> {
    return this.workorderDataService.cancelWorkOrder(cancelPayload);
  }

  /**
   * Cancel a task
   * @param cancelPayload the payload to cancel the task
   * @returns the workorder
   */
    public cancelTask(
      cancelPayload: CancelTask
    ): Observable<Workorder> {
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
  ): Observable<Workorder[]> {
    return this.workorderDataService.getEquipmentWorkOrderHistory(
      assetTable,
      assetId
    );
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
      wkoCompletionStartDate: featureWorkorder.properties['wkoCompletionStartDate'],
      wkoCompletionEndDate: featureWorkorder.properties['wkoCompletionEndDate'],
      wkoPlanningStartDate: featureWorkorder.properties['wkoPlanningStartDate'],
      wkoPlanningEndDate: featureWorkorder.properties['wkoPlanningEndDate'],
      wtsId: featureWorkorder.properties['wkoWtsId'],
      wkoCreationComment : featureWorkorder.properties['wkoCreationComment'],
      wkoCancelComment: featureWorkorder.properties['wkoCancelComment'],
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
      tskCompletionStartDate: task.properties['tskCompletionStartDate'],
      tskCompletionEndDate: task.properties['tskCompletionEndDate'],
      tskReportDate: task.properties['tskReportDate'],
      wtrId: task.properties['wtrId'],
      wtsId: task.properties['wtsId'],
      wkoId: task.properties['wkoId'],
    };
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
  public handleConnectionErrorOnWorkorderOperations(error: Error, workorder: Workorder, syncOperations: SyncOperations): Observable<Workorder> {
    if (error.name === 'TimeoutError' || (error instanceof HttpErrorResponse && !navigator.onLine)) {
      workorder.syncOperation = syncOperations;
      this.saveCacheWorkorder(workorder);
      this.startPeriodicSyncWorkorders();

      return of(workorder);
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
      interval(300000).pipe(
        // Stop the interval when there are no more workorders to sync
        takeUntil(this.stopSyncOperations$),
        // Perform the synchronization
        switchMap(() => {
          // Create an array of observables to perform the synchronization
          const syncsToPerform: Observable<any>[] = workordersToSync.map(
            (wko) => {
              // Get the right function to perform the synchronization
              return this.syncOperations[wko.syncOperation](wko).pipe(
                // If the synchronization is successful, delete the workorder from the cache
                tap((workorder) => {
                  console.log('Workorder updated successfully', workorder);
                  this.deleteCacheWorkorder(workorder);
                }),
              );
            }
          );

          // Perform in parallel the synchronization of all workorders
          // and stop the interval when all workorders are synchronized
          return forkJoin(syncsToPerform).pipe(
            tap(() => {
              this.stopSyncOperations$.next();
              this.stopSyncOperations$.complete();
            }),
            catchError((error) => {
              console.error('Failed to perform the synchronization', error);
              return EMPTY;
            })
          )
        })
      ).subscribe();
    }
  }
}
