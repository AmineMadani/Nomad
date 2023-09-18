import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, forkJoin, switchMap, tap, withLatestFrom } from 'rxjs';
import { CacheService } from './cache.service';
import { CityService } from './city.service';
import { ContractService } from './contract.service';
import { LayerService } from './layer.service';
import { TemplateService } from './template.service';
import { UserService } from './user.service';
import { WorkorderService } from './workorder.service';
import { PreferenceService } from './preference.service';
import { BasemapOfflineService } from './basemapOffline.service';
import { DownloadFileResult } from '@capacitor/filesystem';


export enum DownloadState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface OfflineDownload {
  state: DownloadState;
  progressPercentage?: number;
  diskSize?: string;
  lastUpdateDate?: Date;
}


@Injectable({
  providedIn: 'root',
})
export class OfflineDownloadService {
  constructor(
    private contractService: ContractService,
    private cityService: CityService,
    private layerService: LayerService,
    private workorderService: WorkorderService,
    private userService: UserService,
    private templateService: TemplateService,
    private cacheService: CacheService,
    private preferenceService: PreferenceService,
    private basemapOfflineService: BasemapOfflineService
  ) {
  }

  // Referential
  referentialOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });
  // Equipments
  equipmentOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });
  // Basemaps
  basemapOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });


  initReferentialDownloadState(): void {
    this.preferenceService.getPreference('referentialDownload').then((referentialDownload) => {
      if (referentialDownload) {
        referentialDownload = JSON.parse(referentialDownload) as OfflineDownload;
        this.referentialOfflineDownload.next(referentialDownload);
      }
    });

    this.preferenceService.getPreference('tileDownload').then((tileDownload) => {
      if (tileDownload) {
        tileDownload = JSON.parse(tileDownload) as OfflineDownload;
        this.equipmentOfflineDownload.next(tileDownload);
      }
    });

    this.preferenceService.getPreference('basemapDownload').then((basemapDownload) => {
      if (basemapDownload) {
        basemapDownload = JSON.parse(basemapDownload) as OfflineDownload;
        this.basemapOfflineDownload.next(basemapDownload);
      }
    });
  }

  getReferentialOfflineDownload(): Observable<OfflineDownload> {
    return this.referentialOfflineDownload.asObservable();
  }

  getEquipmentOfflineDownload(): Observable<OfflineDownload> {
    return this.equipmentOfflineDownload.asObservable();
  }

  getBasemapOfflineDownload(): Observable<OfflineDownload> {
    return this.basemapOfflineDownload.asObservable();
  }

  downloadReferential() {
    this.dumpReferential();

    this.referentialOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    const nbReferentialCalls: number = 10;
    forkJoin({
      contracts: this.contractService.getAllContracts().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      cities: this.cityService.getAllCities().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      layers: this.layerService.getAllLayers().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      vLayerWtrs: this.layerService.getAllVLayerWtr().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      layerIndexes: this.layerService.getLayerIndexes().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      workTaskStatus: this.workorderService.getAllWorkorderTaskStatus().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      workTaskReasons: this.workorderService.getAllWorkorderTaskReasons().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      formTemplates: this.templateService.getFormsTemplate().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      permissions: this.userService.getAllPermissions().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
      layerReferences: this.layerService.getUserLayerReferences().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialOfflineDownload))),
    }).pipe(
      catchError(error => {
        console.error("Error during fetchAllReferential:", error);

        this.dumpReferential();

        return EMPTY;
      })
    ).subscribe(async () => {
      const diskSize = await this.cacheService.getReferentialSize();

      this.referentialOfflineDownload.next({
        state: DownloadState.DONE,
        progressPercentage: 100,
        diskSize: diskSize,
        lastUpdateDate: new Date(),
      });

      const cachedValue: OfflineDownload = this.referentialOfflineDownload.getValue();
      this.preferenceService.setPreference('referentialDownload', JSON.stringify(cachedValue));
    });
  }

  dumpReferential() {
    this.cacheService.clearReferentials();

    this.referentialOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.referentialOfflineDownload.getValue();
    this.preferenceService.setPreference('referentialDownload', JSON.stringify(cachedValue));
  }

  downloadEquipments() {
    this.dumpEquipments();

    this.equipmentOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    // Each request will send 5 tiles max
    const chunkSize = 5;

    // Get layers
    forkJoin({
      layers: this.layerService.getAllLayers(),
      indexes: this.layerService.getLayerIndexes(),
    }).pipe(
      // Get indexes
      switchMap(({ layers, indexes }) => {
        const visibleLayers = layers.filter(layer => layer.lyrDisplay);
        const indexFiles: string[] = (indexes as any)['features'].map(i => i['properties']['file']);
        const nbTileCalls: number = visibleLayers.length * Math.ceil(indexFiles.length / chunkSize);

        const apiCalls = this.createApiCalls(visibleLayers, indexFiles, chunkSize, nbTileCalls);

        // Get all tiles
        return forkJoin(apiCalls).pipe(
          tap(async () => {
            const diskSize = await this.cacheService.getTilesSize();

            this.equipmentOfflineDownload.next({
              state: DownloadState.DONE,
              progressPercentage: 100,
              diskSize: diskSize,
              lastUpdateDate: new Date(),
            });

            const cachedValue: OfflineDownload = this.equipmentOfflineDownload.getValue();
            this.preferenceService.setPreference('tileDownload', JSON.stringify(cachedValue));
          }),
          catchError(error => {
            console.error("Error during fetchAllTiles:", error);

            this.dumpEquipments();

            return EMPTY;
          })
        );
      }),
      catchError(error => {
        console.error("Error during fetchLayers and indexes:", error);

        this.dumpEquipments();

        return EMPTY;
      })
    ).subscribe();
  }

  private createApiCalls(visibleLayers, indexFiles, chunkSize, nbTileCalls) {
    const apiCalls: any = {};
    let requestNumber = 0;

    for (const layer of visibleLayers) {
      const outputList: string[][] = [];
      for (let i = 0; i < indexFiles.length; i += chunkSize) {
        outputList.push(indexFiles.slice(i, i + chunkSize));
      }

      for (const files of outputList) {
        apiCalls[`request_${requestNumber}`] = this.layerService
          .getListLayerFile(layer.lyrTableName, files)
          .pipe(
            tap(() => this.increaseProgressPercentage(nbTileCalls, this.equipmentOfflineDownload))
          );
        requestNumber++;
      }
    }

    return apiCalls;
  }

  dumpEquipments() {
    this.cacheService.clearTiles();

    this.equipmentOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.equipmentOfflineDownload.getValue();
    this.preferenceService.setPreference('tileDownload', JSON.stringify(cachedValue));
  }

  downloadBasemap() {
    this.basemapOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    this.basemapOfflineService.downloadOfflineData(
      'https://veolia-nomad-hp-basemaps.s3.amazonaws.com/67E.mbtiles?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA43GFG7DS7ASFLGLB%2F20230914%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20230914T101022Z&X-Amz-Expires=604799&X-Amz-SignedHeaders=host&X-Amz-Signature=4629e7a9c179f447a7c1341c6d1dc7ba1eb8573bb0af4a1a6f3f046a3958f1fd',
      (newPercentage: number) => {
        const currentOfflineDownload = this.basemapOfflineDownload.getValue();
        if (currentOfflineDownload.progressPercentage !== newPercentage) {
          this.basemapOfflineDownload.next({
            ...currentOfflineDownload,
            progressPercentage: newPercentage
          });
        }
      },
      (downloadFileResult: DownloadFileResult) => {
        const sizeInMo = downloadFileResult.blob.size / (1024 * 1024);

        this.basemapOfflineDownload.next({
          state: DownloadState.DONE,
          progressPercentage: 100,
          diskSize: `${sizeInMo.toFixed(2)} mo`,
          lastUpdateDate: new Date(),
        });

        const cachedValue: OfflineDownload = this.basemapOfflineDownload.getValue();
        this.preferenceService.setPreference('basemapDownload', JSON.stringify(cachedValue));
      }
    );
  }

  dumpBasemap() {
    this.basemapOfflineService.deleteDatabase();

    this.basemapOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.basemapOfflineDownload.getValue();
    this.preferenceService.setPreference('basemapDownload', JSON.stringify(cachedValue));
  }

  downloadAll() {
    this.downloadEquipments();
    this.downloadBasemap();
    this.downloadReferential();
  }

  dumpAll() {
    this.dumpEquipments();
    this.dumpBasemap();
    this.dumpReferential();
  }

  // Increase progress percentage
  private increaseProgressPercentage(listSize: number, offlineDownloadSubject: BehaviorSubject<OfflineDownload>) {
    const currentOfflineDownload = offlineDownloadSubject.getValue();

    const newPercentage = currentOfflineDownload.progressPercentage + (100 / listSize);
    offlineDownloadSubject.next({
      ...currentOfflineDownload,
      progressPercentage: Number(newPercentage.toFixed(2))
    });
  }
}
