import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, forkJoin, switchMap, tap, withLatestFrom } from 'rxjs';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { CityService } from './city.service';
import { ContractService } from './contract.service';
import { LayerService } from './layer.service';
import { TemplateService } from './template.service';
import { UserService } from './user.service';
import { WorkorderService } from './workorder.service';
import { PreferenceService } from './preference.service';
import { BasemapOfflineService } from './basemapOffline.service';
import { UtilsService } from './utils.service';

export enum DownloadState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum DonwloadCacheKey {
  REFERENTIALS = 'referentialsDownload',
  TILES = 'tilesDownload',
  BASEMAPS = 'basemapsDownload',
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
    private basemapOfflineService: BasemapOfflineService,
    private utilsService: UtilsService
  ) {
  }

  // Referentials
  // A BehaviorSubject representing the state of the referentials offline download.
  private referentialsOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });
  // Tiles
  // A BehaviorSubject representing the state of the tiles offline download.
  private tilesOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });
  // Basemaps
  // A BehaviorSubject representing the state of the basemaps offline download.
  private basemapsOfflineDownload: BehaviorSubject<OfflineDownload> = new BehaviorSubject<OfflineDownload>({
    state: DownloadState.NOT_STARTED
  });


  //### Referentials ###//

  /**
    * Fetches the initial download state for the referentials from the preferences.
    * Updates the BehaviorSubject for referentials with the retrieved state.
    *
    * @returns {Promise<OfflineDownload>} The current referentials download state.
    */
  public getInitialReferentialsDownloadState(): Promise<OfflineDownload> {
    return this.getInitialDownloadState(DonwloadCacheKey.REFERENTIALS, this.referentialsOfflineDownload);
  }

  /**
   * Get the observable state of the referentials offline download.
   * @returns Observable of the download state for referentials.
   */
  public getReferentialsOfflineDownload(): Observable<OfflineDownload> {
    return this.referentialsOfflineDownload.asObservable();
  }

  /**
   * Download all referential data offline.
   */
  public downloadReferentials() {
    this.dumpReferentials();

    this.referentialsOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    const nbReferentialCalls: number = 10;
    forkJoin({
      contracts: this.contractService.getAllContracts().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      cities: this.cityService.getAllCities().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      layers: this.layerService.getAllLayers().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      vLayerWtrs: this.layerService.getAllVLayerWtr().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      layerIndexes: this.layerService.getLayerIndexes().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      workTaskStatus: this.workorderService.getAllWorkorderTaskStatus().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      workTaskReasons: this.workorderService.getAllWorkorderTaskReasons().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      formTemplates: this.templateService.getFormsTemplate().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      permissions: this.userService.getAllPermissions().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
      layerReferences: this.layerService.getUserLayerReferences().pipe(tap(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload))),
    }).pipe(
      catchError(() => {
        this.onDownloadReferentialsError();
        return EMPTY;
      })
    ).subscribe(async () => await this.onDownloadReferentialsSuccess());
  }

  /**
   * Reset and clear referentials offline data.
   */
  public dumpReferentials() {
    this.cacheService.clearReferentials();

    this.referentialsOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.referentialsOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.REFERENTIALS, JSON.stringify(cachedValue));
  }

  /**
   * Handle the scenario when there's an error during referentials download.
   */
  private onDownloadReferentialsError() {
    this.utilsService.showErrorMessage("Une erreur est survenue lors du téléchargement des référentiels.");
    this.dumpReferentials();
  }

  /**
   * Handle the successful scenario of referentials download.
   */
  private async onDownloadReferentialsSuccess() {
    const diskSize = await this.cacheService.getReferentialsSize();

    this.referentialsOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: diskSize,
      lastUpdateDate: new Date(),
    });

    const cachedValue: OfflineDownload = this.referentialsOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.REFERENTIALS, JSON.stringify(cachedValue));
  }


  //### Tiles ###//

  /**
    * Fetches the initial download state for the tiles from the preferences.
    * Updates the BehaviorSubject for tiles with the retrieved state.
    *
    * @returns {Promise<OfflineDownload>} The current tiles download state.
    */
  public getInitialTilesDownloadState(): Promise<OfflineDownload> {
    // Assuming there's a tilesOfflineDownload BehaviorSubject
    return this.getInitialDownloadState(DonwloadCacheKey.TILES, this.tilesOfflineDownload);
  }

  /**
   * Get the observable state of the tiles offline download.
   * @returns Observable of the download state for tiles.
   */
  public getTilesOfflineDownload(): Observable<OfflineDownload> {
    return this.tilesOfflineDownload.asObservable();
  }

  /**
   * Download tiles offline.
   */
  public downloadTiles() {
    this.dumpTiles();

    this.tilesOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    // Get required layers and indexes first
    forkJoin({
      layers: this.layerService.getAllLayers(),
      indexes: this.layerService.getLayerIndexes(),
    })
      .pipe(
        catchError(() => {
          this.onDownloadTilesError();
          return EMPTY;
        }),
      )
      .subscribe(async ({ layers, indexes }) => {
        const visibleLayers = layers.filter(layer => layer.lyrDisplay);
        const indexFiles: string[] = (indexes as any)['features'].map(i => i['properties']['file']);
        const nbTiles: number = indexFiles.length * visibleLayers.length;

        // Build one api call for each tile and layer
        for (const layer of visibleLayers) {

          // Send api calls 50 by 50
          const chunkSize: number = 50;
          const outputList: string[][] = [];
          for (let i = 0; i < indexFiles.length; i += chunkSize) {
            outputList.push(indexFiles.slice(i, i + chunkSize));
          }

          // Fill the list of 50 api calls
          for (const files of outputList) {
            const apiCalls: any[] = files.map((file) =>
              this.layerService.getLayerFile(layer.lyrTableName, file)
                .then(() =>
                  this.increaseProgressPercentage(nbTiles, this.tilesOfflineDownload)
                )
            );

            // Send the 50 api calls in the same time
            try {
              await Promise.all(apiCalls);
            } catch (e) {
              this.onDownloadTilesError();
              throw e;
            }
          }
        }

        await this.onFetchTilesSuccess();
      });
  }

  /**
   * Reset and clear tiles offline data.
   */
  public dumpTiles() {
    this.cacheService.clearTiles();

    this.tilesOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.tilesOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.TILES, JSON.stringify(cachedValue));
  }

  /**
   * Handle the successful scenario of tiles fetching.
   */
  private async onFetchTilesSuccess() {
    const diskSize = await this.cacheService.getTilesSize();

    this.tilesOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: diskSize,
      lastUpdateDate: new Date(),
    });

    const cachedValue: OfflineDownload = this.tilesOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.TILES, JSON.stringify(cachedValue));
  }

  /**
   * Handle the scenario when there's an error during tiles download.
   */
  private onDownloadTilesError() {
    this.utilsService.showErrorMessage("Une erreur est survenue lors du téléchargement des équipements.");
    this.dumpTiles();
  }


  //### Basemaps ###//

  /**
  * Fetches the initial download state for the basemaps from the preferences.
  * Updates the BehaviorSubject for basemaps with the retrieved state.
  *
  * @returns {Promise<OfflineDownload>} The current basemaps download state.
  */
  public getInitialBasemapsDownloadState(): Promise<OfflineDownload> {
    // Assuming there's a basemapsOfflineDownload BehaviorSubject
    return this.getInitialDownloadState(DonwloadCacheKey.BASEMAPS, this.basemapsOfflineDownload);
  }

  /**
   * Get the observable state of the basemaps offline download.
   * @returns Observable of the download state for basemaps.
   */
  public getBasemapsOfflineDownload(): Observable<OfflineDownload> {
    return this.basemapsOfflineDownload.asObservable();
  }

  /**
   * Download basemaps offline.
   */
  public downloadBasemaps() {
    this.basemapsOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    const fileToDownload: string =
      'https://veolia-nomad-hp-basemaps.s3.amazonaws.com/63.mbtiles?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA43GFG7DS7ASFLGLB%2F20230919%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20230919T090438Z&X-Amz-Expires=604799&X-Amz-SignedHeaders=host&X-Amz-Signature=a6698a553fbccafcd5e5a2dbd9cbf66f610fbdd7995c4cda16cdf9960358b0f3';

    try {
      this.basemapOfflineService.downloadOfflineData(
        fileToDownload,
        // On percentage progress
        (newPercentage: number) => {
          const currentOfflineDownload = this.basemapsOfflineDownload.getValue();

          newPercentage = Math.round(newPercentage);

          if (currentOfflineDownload.progressPercentage !== newPercentage) {
            this.basemapsOfflineDownload.next({
              ...currentOfflineDownload,
              progressPercentage: newPercentage
            });
          }
        },
        // On complete
        (fileSize: number) => this.onDownloadBasemapSuccess(fileSize)
      );
    } catch (e) {
      this.onDownloadBasemapsError();
    }
  }

  /**
   * Reset and clear basemaps offline data.
   */
  public dumpBasemaps() {
    this.basemapOfflineService.deleteDatabase();

    this.basemapsOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.basemapsOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.BASEMAPS, JSON.stringify(cachedValue));
  }

  /**
   * Handle the successful scenario of basemaps download.
   * @param fileSize The size of the downloaded file.
   */
  private onDownloadBasemapSuccess(fileSize: number) {
    this.basemapsOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: `${fileSize.toFixed(2)} mo`,
      lastUpdateDate: new Date(),
    });

    const cachedValue: OfflineDownload = this.basemapsOfflineDownload.getValue();
    this.preferenceService.setPreference(DonwloadCacheKey.BASEMAPS, JSON.stringify(cachedValue));
  }

  /**
   * Handle the scenario when there's an error during basemaps download.
   */
  private onDownloadBasemapsError() {
    this.utilsService.showErrorMessage("Une erreur est survenue lors du téléchargement des fonds de plan.");
    this.dumpBasemaps();
  }


  //### Download/Dump All ###//

  // ### Utils ### //

  /**
    * Fetches the initial download state for a specific key from the preferences.
    * If the state is stored in the preferences, it will be parsed and emitted
    * through the provided BehaviorSubject.
    * If not, a default NOT_STARTED state will be returned.
    *
    * @param {DonwloadCacheKey} key - The key to fetch the preference.
    * @param {BehaviorSubject<OfflineDownload>} subject - The BehaviorSubject to emit the value.
    * @returns {Promise<OfflineDownload>} The download state for the given key.
  */
  private async getInitialDownloadState(key: DonwloadCacheKey, subject: BehaviorSubject<OfflineDownload>): Promise<OfflineDownload> {
    let downloadState = await this.preferenceService.getPreference(key);

    if (downloadState) {
      downloadState = JSON.parse(downloadState) as OfflineDownload;
      subject.next(downloadState);
    } else {
      downloadState = { state: DownloadState.NOT_STARTED };
    }

    return downloadState;
  }

  /**
   * Helper function to increment the progress percentage of an offline download.
   * @param listSize Size of the list representing items to download.
   * @param offlineDownloadSubject The BehaviorSubject representing the current offline download state.
   */
  private increaseProgressPercentage(listSize: number, offlineDownloadSubject: BehaviorSubject<OfflineDownload>) {
    const currentOfflineDownload = offlineDownloadSubject.getValue();

    let newPercentage = currentOfflineDownload.progressPercentage + (100 / listSize);

    // Ensure the percentage doesn't exceed 100%
    if (newPercentage > 100) {
      newPercentage = 100;
    }

    offlineDownloadSubject.next({
      ...currentOfflineDownload,
      progressPercentage: this.utilsService.roundToDecimalPlaces(newPercentage, 2)
    });
  }
}
