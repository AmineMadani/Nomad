import { Injectable } from '@angular/core';
import { UserReference, ReferenceDisplayType, LayerStyleSummary, LayerStyleDetail, SaveLayerStylePayload, LayerReferences, Layer, VLayerWtr, SearchEquipments } from '../models/layer.model';
import { LayerDataService } from './dataservices/layer.dataservice';
import { GeoJSONObject, NomadGeoJson } from '../models/geojson.model';
import { Observable, catchError, firstValueFrom, lastValueFrom, of, tap, timeout } from 'rxjs';
import { CacheKey, CacheService, ReferentialCacheKey } from './cache.service';
import { ApiSuccessResponse } from '../models/api-response.model';
import { ConfigurationService } from './configuration.service';
import { UtilsService } from './utils.service';
import { LayerGrpAction } from '../models/layer-gp-action.model';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  constructor(
    private layerDataService: LayerDataService,
    private cacheService: CacheService,
    private configurationService: ConfigurationService,
    private utilsService: UtilsService
  ) {
  }

  private layerIndexes: GeoJSONObject;
  private layers: Layer[];
  private vLayerWtr: VLayerWtr[];
  private layerReferences: LayerReferences[];
  private layerGrpActions: LayerGrpAction[];

  private listTileOnLoad: Map<string, string> = new Map<string, string>();

  /**
   * Get the list of user references for a given layer key.
   * @param layerKey The layer key to get the references for.
   * @returns A Promise that resolves to an array of UserReference objects.
   */
  async getUserReferences(layerKey: string): Promise<UserReference[]> {
    let layerReferences: UserReference[] = [];

    let listLayerReferences: LayerReferences[] = [];
    const isCacheDownload: boolean = await this.cacheService.isCacheDownload(CacheKey.REFERENTIALS);
    if (isCacheDownload) {
      listLayerReferences = await this.utilsService.fetchPromiseWithTimeout({
        fetchPromise: this.layerDataService.getUserLayerReferences(),
        timeout: this.configurationService.offlineTimeoutEquipment
      }).catch(async (error) => {
        if (this.utilsService.isOfflineError(error)) {
          const feature = await this.getUserLayerReferences();
          return feature;
        }

        throw error;
      });
    } else {
      listLayerReferences = await this.layerDataService.getUserLayerReferences();
    }


    if (listLayerReferences) {
      const layer = listLayerReferences.find((layer) => layer.layerKey === layerKey);
      if (layer) {
        layerReferences = layer.references;
      }
    }
    return layerReferences;
  }

  /**
   * Get the list of synthetic reference keys for a given layer key.
   * @param layerKey The layer key to get the synthetic reference keys for.
   * @returns A Promise that resolves to an array of string reference keys.
   */
  async getSyntheticUserReferenceKeys(layerKey: string): Promise<string[]> {
    const userLayerReferences: UserReference[] = await this.getUserReferences(layerKey);
    return userLayerReferences.filter((ref) => ref.displayType === ReferenceDisplayType.SYNTHETIC).map((ref) => ref.referenceKey);;
  }

  /**
   * It fetches the indexes of a layer from indexed db if present or server
   * If successful, it stores the layer in IndexedDB.
   * @returns The geojson of the index of the layer.
   */
  public async getLayerIndexes(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = true
  ): Promise<GeoJSONObject> {
    if (!this.layerIndexes || forceGetFromDb) {
      this.layerIndexes = await this.cacheService.fetchReferentialsData<GeoJSONObject>(
        ReferentialCacheKey.LAYER_INDEX,
        () => this.layerDataService.getLayerIndexes(),
        isDownloadMode
      );
    }

    return this.layerIndexes;
  }

  /**
  * Fetches the tile of a layer from server.
  * If successful, stores the layer's file in IndexedDB.
  * If the network duration is superior to 2 seconds, it returns the indexedDB data.
  * @param {string} layerKey - Key of the layer.
  * @param {string} file - The file where the view is.
  * @returns The GeoJSON file for the current tile.
 */
  public async getLayerFile(
    layerKey: string,
    file: string,
    startDate?: Date,
    isDownloadMode: boolean = false
  ): Promise<NomadGeoJson> {
    this.listTileOnLoad.set(layerKey, 'Chargement de la couche ' + layerKey);

    const featureNumber: number = Number(file.replace('index_', '').replace('.geojson', ''));
    file = file.replace('index', layerKey);

    const params = {
      startDate: startDate
    }

    const files = await this.cacheService.fetchLayerFile(layerKey, featureNumber, file, params, isDownloadMode);

    this.listTileOnLoad.delete(layerKey);

    return files;
  }

  /**
   * Method to know if layer data is currently loading from the server
   * @returns true is data is currently loading
   */
  public isDataLoading(): boolean {
    return this.listTileOnLoad.size > 0;
  }

  /**
   * Method to get the list of layer currently loading from server (index or tile)
   * @returns The list of layer currently loading
   */
  public getListLoadingData(): string[] {
    return [
      ...Array.from(this.listTileOnLoad.values())
    ];
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public async getAllLayers(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ): Promise<Layer[]> {
    if (!this.layers || forceGetFromDb) {
      this.layers = await this.cacheService.fetchReferentialsData<Layer[]>(
        ReferentialCacheKey.LAYERS,
        () => this.layerDataService.getAllLayers(),
        isDownloadMode
      );
    }

    return this.layers;
  }

  /**
   * Method to get the wanted layer by key name
   * @returns the selected layer
   */
  public async getLayerByKey(key: string): Promise<Layer> {
    return (await this.getAllLayers()).find(layer => layer.lyrTableName == key);
  }

  public async getEquipmentByLayerAndId(layer: string, id: string): Promise<any> {
    let searchEquipment:SearchEquipments[] = [{
      lyrTableName: layer,
      equipmentIds: [id],
      allColumn: true
    }]
    let response = await this.getEquipmentsByLayersAndIds(searchEquipment);
    return response[0];
  }

  public getEquipmentsByLayersAndIds(idsLayers: any): Promise<any> {
    return this.cacheService.fetchEquipmentsByLayerIds(idsLayers);
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Promise<LayerStyleSummary[]> {
    return this.layerDataService.getAllLayerStyles();
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Promise<LayerStyleDetail> {
    return this.layerDataService.getLayerStyleById(layerStyleId);
  }

  /**
   * Create a layer style.
   */
  public async createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Promise<ApiSuccessResponse> {
    const response = await this.layerDataService.createLayerStyle(layerStyle, lyrId);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Update a layer style.
   */
  public async updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Promise<ApiSuccessResponse> {
    const response = await this.layerDataService.updateLayerStyle(layerStyle, lseId);

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Promise<ApiSuccessResponse> {
    return this.layerDataService.deleteLayerStyle(lseIds)
      .then((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
        return successResponse;
      });
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns An observable that resolves to the layer references.
 */
  public async getUserLayerReferences(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ): Promise<LayerReferences[]> {
    if (!this.layerReferences || forceGetFromDb) {
      this.layerReferences = await this.cacheService.fetchReferentialsData<LayerReferences[]>(
        ReferentialCacheKey.LAYER_REFERENCES,
        () => this.layerDataService.getUserLayerReferences(),
        isDownloadMode
      )
    }

    return this.layerReferences;
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }): Promise<any> {
    return this.layerDataService.saveLayerReferencesUser(payload)
      .then((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
        return successResponse;
      });
  }

  /**
  * Get all VLayerWtr.
  * @returns A promise that resolves to the list of VLayerWtr.
  */
  public async getAllVLayerWtr(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ): Promise<VLayerWtr[]> {
    if (!this.vLayerWtr || forceGetFromDb) {
      this.vLayerWtr = await this.cacheService.fetchReferentialsData<VLayerWtr[]>(
        ReferentialCacheKey.V_LAYER_WTR,
        () => this.layerDataService.getAllVLayerWtr(),
        isDownloadMode
      );
    }

    return this.vLayerWtr;
  }

  public async getAllLayerGrpActions(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ) {
    if (!this.vLayerWtr || forceGetFromDb) {
      this.layerGrpActions = await this.cacheService.fetchReferentialsData<LayerGrpAction[]>(
        ReferentialCacheKey.LAYER_GRP_ACTION,
        () => this.layerDataService.getAllLayerGrpActions(),
        isDownloadMode
      );
    }

    return this.layerGrpActions;
  }
}
