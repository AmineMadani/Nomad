import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheKey, CacheService } from './cache.service';
import { CityService } from './city.service';
import { ContractService } from './contract.service';
import { LayerService } from './layer.service';
import { TemplateService } from './template.service';
import { UserService } from './user.service';
import { WorkorderService } from './workorder.service';
import { PreferenceService } from './preference.service';
import { BasemapOfflineService } from './basemapOffline.service';
import { UtilsService } from './utils.service';
import { BasemapTemplate } from '../models/basemap.model';

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
  // Only for basemaps
  basemapDownloaded?: string;
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
  public async getInitialReferentialsDownloadState(): Promise<OfflineDownload> {
    const downloadState = await this.cacheService.getCacheDownloadState(CacheKey.REFERENTIALS);

    this.referentialsOfflineDownload.next(downloadState);

    return downloadState;
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

    const nbReferentialCalls: number = 11;
    Promise.all([
      this.contractService.getAllContracts(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.cityService.getAllCities(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.layerService.getAllLayers(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.layerService.getAllVLayerWtr(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.layerService.getLayerIndexes(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.workorderService.getAllWorkorderTaskStatus(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.workorderService.getAllWorkorderTaskReasons(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.templateService.getFormsTemplate(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.userService.getAllPermissions(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.layerService.getUserLayerReferences(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
      this.layerService.getAllLayerGrpActions(true, true).then(() => this.increaseProgressPercentage(nbReferentialCalls, this.referentialsOfflineDownload)),
    ])
      .then(async () => await this.onDownloadReferentialsSuccess())
      .catch((error) => {
        this.onDownloadReferentialsError();
        throw error;
      });
  }

  /**
   * Reset and clear referentials offline data.
   */
  public dumpReferentials() {
    this.cacheService.clearTable(CacheKey.REFERENTIALS);

    this.referentialsOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.referentialsOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.REFERENTIALS, cachedValue);
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
    const diskSize = await this.cacheService.getTableSize(CacheKey.REFERENTIALS);

    this.referentialsOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: diskSize,
      lastUpdateDate: new Date(),
    });

    const cachedValue: OfflineDownload = this.referentialsOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.REFERENTIALS, cachedValue);
  }


  //### Tiles ###//

  /**
    * Fetches the initial download state for the tiles from the preferences.
    * Updates the BehaviorSubject for tiles with the retrieved state.
    *
    * @returns {Promise<OfflineDownload>} The current tiles download state.
    */
  public async getInitialTilesDownloadState(): Promise<OfflineDownload> {
    const downloadState = await this.cacheService.getCacheDownloadState(CacheKey.TILES);

    this.tilesOfflineDownload.next(downloadState);

    return downloadState;
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
  public async downloadTiles() {
    this.dumpTiles();

    this.tilesOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    try {
      // Get required layers and indexes first
      const results = await Promise.all([
        this.layerService.getAllLayers(),
        this.layerService.getLayerIndexes()
      ]);

      const visibleLayers = results[0].filter(layer => layer.lyrDisplay);
      const indexFiles: string[] = (results[1] as any)['features'].map(i => i['properties']['file']);
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
            this.layerService.getLayerFile(layer.lyrTableName, file, undefined, true)
              .then(() =>
                this.increaseProgressPercentage(nbTiles, this.tilesOfflineDownload)
              )
          );

          // Send the 50 api calls in the same time
          await Promise.all(apiCalls);
        }
      }

      await this.onFetchTilesSuccess();
    } catch (error) {
      this.onDownloadTilesError();
      throw error;
    }
  }

  /**
   * Reset and clear tiles offline data.
   */
  public dumpTiles() {
    this.cacheService.clearTable(CacheKey.TILES);

    this.tilesOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.tilesOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.TILES, cachedValue);
  }

  /**
   * Handle the successful scenario of tiles fetching.
   */
  private async onFetchTilesSuccess() {
    const diskSize = await this.cacheService.getTableSize(CacheKey.TILES);

    this.tilesOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: diskSize,
      lastUpdateDate: new Date(),
    });

    const cachedValue: OfflineDownload = this.tilesOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.TILES, cachedValue);
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
  public async getInitialBasemapsDownloadState(): Promise<OfflineDownload> {
    const downloadState = await this.cacheService.getCacheDownloadState(CacheKey.BASEMAPS);

    this.basemapsOfflineDownload.next(downloadState);

    return downloadState;
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
  public async downloadBasemap(basemap: BasemapTemplate) {
    this.basemapsOfflineDownload.next({
      state: DownloadState.IN_PROGRESS,
      progressPercentage: 0
    });

    try {
      await this.basemapOfflineService.downloadOfflineData(
        basemap.link,
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
      );

      this.onDownloadBasemapSuccess(basemap);
    } catch (error) {
      this.onDownloadBasemapsError();
      throw error;
    }
  }

  /**
   * Reset and clear basemaps offline data.
   */
  public dumpBasemap() {
    this.basemapOfflineService.deleteDatabase();

    this.basemapsOfflineDownload.next({
      state: DownloadState.NOT_STARTED,
      progressPercentage: 0
    });

    const cachedValue: OfflineDownload = this.basemapsOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.BASEMAPS, cachedValue);
  }

  /**
   * Handle the successful scenario of basemaps download.
   * @param diskSize The size of the downloaded files.
   */
  private onDownloadBasemapSuccess(basemapDownloaded: BasemapTemplate) {
    this.basemapsOfflineDownload.next({
      state: DownloadState.DONE,
      progressPercentage: 100,
      diskSize: `${basemapDownloaded.size} mo`,
      lastUpdateDate: new Date(),
      basemapDownloaded: basemapDownloaded.name,
    });

    const cachedValue: OfflineDownload = this.basemapsOfflineDownload.getValue();
    this.cacheService.setCacheDownloadState(CacheKey.BASEMAPS, cachedValue);
  }

  /**
   * Handle the scenario when there's an error during basemaps download.
   */
  private onDownloadBasemapsError() {
    this.utilsService.showErrorMessage("Une erreur est survenue lors du téléchargement des fonds de plan.");
    this.dumpBasemap();
  }


  //### Download/Dump All ###//

  // ### Utils ### //

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
