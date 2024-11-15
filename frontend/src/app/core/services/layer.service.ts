import { Injectable } from '@angular/core';
import {
  UserReference,
  ReferenceDisplayType,
  LayerStyleSummary,
  LayerStyleDetail,
  SaveLayerStylePayload,
  LayerReferences,
  Layer,
  VLayerWtr,
  GeographicalTypeEnum,
} from '../models/layer.model';
import { LayerDataService } from './dataservices/layer.dataservice';
import { GeoJSONObject, NomadGeoJson } from '../models/geojson.model';
import {
  Observable,
} from 'rxjs';
import { CacheKey, CacheService, ReferentialCacheKey } from './cache.service';
import { ApiSuccessResponse } from '../models/api-response.model';
import { ConfigurationService } from './configuration.service';
import { UtilsService } from './utils.service';
import { LayerGrpAction } from '../models/layer-gp-action.model';
import { MultiAssetsModalComponent } from 'src/app/pages/home/drawers/workorder/pages/multi-assets-modal/multi-assets-modal.component';
import { ModalController } from '@ionic/angular';
import { Asset, SearchAssets, isAssetTemp } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  constructor(
    private layerDataService: LayerDataService,
    private cacheService: CacheService,
    private configurationService: ConfigurationService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController
  ) {}

  private layerIndexes: GeoJSONObject;
  private layers: Layer[];
  private vLayerWtr: VLayerWtr[];
  private layerReferences: LayerReferences[];
  private layerGrpActions: LayerGrpAction[];

  private listTileOnLoad: Map<string, string> = new Map<string, string>();

  /**
   * Checks asset based on various criteria such as layer types, contracts, and geometry types.
   * If a mix of criteria is detected, a modal is presented to the user for further actions.
   *
   * @param assets - Array of asset objects to be checked.
   * @returns {Promise<{ filtred: boolean; filtredAssets?: any[] }>} - Filtered array of asset based on user actions in the modal.
   */
  public async checkAssets(
    assets: Asset[]
  ): Promise<{ filtred: boolean; filtredAssets?: any[] }> {
    let filtredAssets: any[] | undefined;
    let filtred = false;

    let isMultilayerGrpActions = false;
    // Check for multiples lyrTableName
    const hasMultipleTableNames = new Set(assets.map(a => a.lyrTableName)).size >= 2;
    if (hasMultipleTableNames) {
      const layerGrpActions = await this.getAllLayerGrpActions();
      // Check if all assets are included in at least one layerGrpAction
      isMultilayerGrpActions = !assets.every(asset =>
        layerGrpActions.some(grpAction => grpAction.lyrTableNames.includes(asset.lyrTableName))
      );
    }

    const layers = await this.getAllLayers();
    // Checking if we have a mix of dw/ww assets
    const isMultiWater =
      [
        // Removing duplicates
        ...new Set(
          // Finding the differents dom codes for the current layers
          layers
            .filter((l: Layer) => {
              if (
                assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
              ) {
                return true;
              } else {
                return false;
              }
            })
            .map((l) => l.domCode)
        ),
      ].length === 2;

    // Checking if the assets are on more than one contract
    const isMultiContract =
      [...new Set(assets.filter((ast) => !isAssetTemp(ast)).map((ast) => ast.ctrId))].length > 1;

    // Checking if there is a difference between assets GEOMs
    const isMultiGeomType =
      [
        ...new Set(
          layers
            .filter((l: Layer) =>
              assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
            )
            .map((l) => l.lyrGeomType)
        ),
      ].length > 1;

    if (isMultilayerGrpActions || isMultiGeomType || isMultiWater || isMultiContract) {
      filtred = true;
      const selectedLayers = layers.filter((l) =>
        assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
      );

      const modal = await this.modalCtrl.create({
        component: MultiAssetsModalComponent,
        componentProps: {
          assets: assets,
          selectedLayers,
          isMultiContract,
          isMultiWater,
        },
        backdropDismiss: false,
      });
      modal.present();
      const { data } = await modal.onWillDismiss();
      // If data is received from the modal, update filtredAssets
      if (data) {
        filtredAssets = data;
      }
    }
    return { filtred, filtredAssets };
  }
  /**
   * Get the list of user references for a given layer key.
   * @param layerKey The layer key to get the references for.
   * @returns A Promise that resolves to an array of UserReference objects.
   */
  async getUserReferences(layerKey: string): Promise<UserReference[]> {
    let layerReferences: UserReference[] = [];

    let listLayerReferences: LayerReferences[] = [];
    const isCacheDownload: boolean = await this.cacheService.isCacheDownload(
      CacheKey.REFERENTIALS
    );
    if (isCacheDownload) {
      listLayerReferences = await this.utilsService
        .fetchPromiseWithTimeout({
          fetchPromise: this.layerDataService.getUserLayerReferences(),
          timeout: this.configurationService.offlineTimeoutAsset,
        })
        .catch(async (error) => {
          if (this.utilsService.isOfflineError(error)) {
            const feature = await this.getUserLayerReferences();
            return feature;
          }

          throw error;
        });
    } else {
      listLayerReferences =
        await this.layerDataService.getUserLayerReferences();
    }

    if (listLayerReferences) {
      const layer = listLayerReferences.find(
        (layer) => layer.layerKey === layerKey
      );
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
    const userLayerReferences: UserReference[] = await this.getUserReferences(
      layerKey
    );
    return userLayerReferences
      .filter((ref) => ref.displayType === ReferenceDisplayType.SYNTHETIC)
      .map((ref) => ref.referenceKey);
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
      this.layerIndexes =
        await this.cacheService.fetchReferentialsData<GeoJSONObject>(
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

    const featureNumber: number = Number(
      file.replace('index_', '').replace('.geojson', '')
    );
    file = file.replace('index', layerKey);

    const params = {
      startDate: startDate,
    };

    const files = await this.cacheService.fetchLayerFile(
      layerKey,
      featureNumber,
      file,
      params,
      isDownloadMode
    );

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
    return [...Array.from(this.listTileOnLoad.values())];
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
    return (await this.getAllLayers()).find(
      (layer) => layer.lyrTableName == key
    );
  }

  public async getAssetByLayerAndId(
    layer: string,
    id: string
  ): Promise<Asset> {
    const searchAsset: SearchAssets[] = [
      {
        lyrTableName: layer,
        assetIds: [id],
        allColumn: true,
      },
    ];
    const response = await this.getAssetsByLayersAndIds(searchAsset);
    return response[0];
  }

  public getAssetsByLayersAndIds(idsLayers: SearchAssets[]): Promise<Asset[]> {
    return this.cacheService.fetchAssetsByLayerIds(idsLayers);
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
  public async createLayerStyle(
    layerStyle: SaveLayerStylePayload,
    lyrId: number
  ): Promise<ApiSuccessResponse> {
    const response = await this.layerDataService.createLayerStyle(
      layerStyle,
      lyrId
    );

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Update a layer style.
   */
  public async updateLayerStyle(
    layerStyle: SaveLayerStylePayload,
    lseId: number
  ): Promise<ApiSuccessResponse> {
    const response = await this.layerDataService.updateLayerStyle(
      layerStyle,
      lseId
    );

    this.utilsService.showSuccessMessage(response.message);

    return response;
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Promise<ApiSuccessResponse> {
    return this.layerDataService
      .deleteLayerStyle(lseIds)
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
      this.layerReferences = await this.cacheService.fetchReferentialsData<
        LayerReferences[]
      >(
        ReferentialCacheKey.LAYER_REFERENCES,
        () => this.layerDataService.getUserLayerReferences(),
        isDownloadMode
      );
    }

    return this.layerReferences;
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: {
    layerReferences: UserReference[];
    userIds: number[];
  }): Promise<any> {
    return this.layerDataService
      .saveLayerReferencesUser(payload)
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
      this.vLayerWtr = await this.cacheService.fetchReferentialsData<
        VLayerWtr[]
      >(
        ReferentialCacheKey.V_LAYER_WTR,
        () => this.layerDataService.getAllVLayerWtr(),
        isDownloadMode
      );
    }

    return this.vLayerWtr;
  }

  public getAssetByPartialId(assetPartialId: string): Observable<string[]> {
    return this.layerDataService.getAssetByPartialId(assetPartialId);
  }

  public async getAllLayerGrpActions(
    forceGetFromDb: boolean = false,
    isDownloadMode: boolean = false
  ) {
    if (!this.layerGrpActions || forceGetFromDb) {
      this.layerGrpActions = await this.cacheService.fetchReferentialsData<
        LayerGrpAction[]
      >(
        ReferentialCacheKey.LAYER_GRP_ACTION,
        () => this.layerDataService.getAllLayerGrpActions(),
        isDownloadMode
      );
    }

    return this.layerGrpActions;
  }

  public getAssetIdsByLayersAndFilterIds(
    layerKeys: string[],
    listId: number[],
    type: GeographicalTypeEnum
  ): Promise<SearchAssets[]> {
    return this.layerDataService.getAssetIdsByLayersAndFilterIds(layerKeys, listId, type);
  }
}
