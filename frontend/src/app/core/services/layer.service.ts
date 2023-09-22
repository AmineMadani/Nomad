import { Injectable } from '@angular/core';
import { UserReference, ReferenceDisplayType, LayerStyleSummary, LayerStyleDetail, SaveLayerStylePayload, LayerReferences, Layer, VLayerWtr } from '../models/layer.model';
import { LayerDataService } from './dataservices/layer.dataservice';
import { GeoJSONObject, NomadGeoJson } from '../models/geojson.model';
import { AppDB } from '../models/app-db.model';
import { Observable, catchError, firstValueFrom, lastValueFrom, map, tap, timeout } from 'rxjs';
import { CacheService, ReferentialCacheKey } from './cache.service';
import { ApiSuccessResponse } from '../models/api-response.model';
import { ConfigurationService } from './configuration.service';
import { UtilsService } from './utils.service';

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
    this.db = new AppDB();
  }

  private db: AppDB;

  private listTileOnLoad: Map<string, string> = new Map<string, string>();

  /**
   * Get the list of user references for a given layer key.
   * @param layerKey The layer key to get the references for.
   * @returns A Promise that resolves to an array of UserReference objects.
   */
  async getUserReferences(layerKey: string): Promise<UserReference[]> {
    let layerReferences: UserReference[] = [];
    const listLayerReferences = await firstValueFrom(this.layerDataService.getUserLayerReferences());
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
  public getLayerIndexes(): Observable<GeoJSONObject> {
    return this.cacheService.fetchReferentialsData<GeoJSONObject>(
      ReferentialCacheKey.LAYER_INDEX,
      () => this.layerDataService.getLayerIndexes()
    );
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
    file: string
  ): Promise<NomadGeoJson> {
    this.listTileOnLoad.set(layerKey, 'Chargement de la couche ' + layerKey);
    /* It's getting the number from the file name. */
    const featureNumber: number = Number(file.replace('index_','').replace('.geojson',''));
    file = file.replace('index',layerKey);
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req: NomadGeoJson = await lastValueFrom(
      this.layerDataService.getLayerFile(layerKey, featureNumber)
        .pipe(
          timeout(this.configurationService.offlineTimeoutTile),
          catchError(async () => {
            const tile = await this.db.tiles.get(file);
            if (tile) {
              return tile.data;
            }
            return null;
          })
        )
    );
    if (!req) {
      this.listTileOnLoad.delete(layerKey);
      throw new Error(`Failed to fetch tile ${featureNumber} for ${layerKey}`);
    }

    await this.db.tiles.put({ data: req, key: file }, file);

    this.listTileOnLoad.delete(layerKey);
    return req;
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
  public getAllLayers(): Observable<Layer[]> {
    return this.cacheService.fetchReferentialsData<Layer[]>(
      ReferentialCacheKey.LAYERS,
      () => this.layerDataService.getAllLayers()
    );
  }

  /**
   * Method to get the wanted layer by key name
   * @returns the selected layer
   */
  public async getLayerByKey(key: string): Promise<Layer> {
    return (await firstValueFrom(this.cacheService.fetchReferentialsData<Layer[]>(
      ReferentialCacheKey.LAYERS,
      () => this.layerDataService.getAllLayers()
    ))).find(layer => layer.lyrTableName == key);
  }

  public async getEquipmentByLayerAndId(layer: string, id: string, forcedCache: boolean = false): Promise<any> {
    if(forcedCache) {
      const feature = await this.cacheService.getFeatureByLayerAndFeatureId(
        layer,
        id
      );
      if(feature) {
        return { id: feature.id, ...feature.properties };
      }
    }
    return firstValueFrom(
      this.layerDataService.getEquipmentByLayerAndId(layer, id)
        .pipe(
          map((equipment: any[]) => equipment[0]),
          timeout(this.configurationService.offlineTimeoutEquipment),
          catchError(async () => {
            const feature = await this.cacheService.getFeatureByLayerAndFeatureId(
              layer,
              id
            );
            return { id: feature.id, ...feature.properties };
          })
        )
    );
  }

  public async getEquipmentsByLayersAndIds(idsLayers: any): Promise<any> {
    //Check if we find the equipment in cached
    let res = [];
    let idsLayersNotLocal = [];
    for(let idLayer of idsLayers) {
      let ids = [];
      for(let ref of idLayer.equipmentIds) {
        const feature = await this.cacheService.getFeatureByLayerAndFeatureId(idLayer.lyrTableName, ref);
        if(feature) {
          res.push(feature.properties)
        } else {
          ids.push(ref);
        }
      }
      if(ids.length > 0) {
        idsLayersNotLocal.push({ equipmentsIds : ids, lyrTableName : idLayer.lyrTableName});
      }
    }
    //If we don't find some of them, we call the backend
    if(idsLayersNotLocal.length == 0) {
      return res;
    } else {
      return [...res, ...(await firstValueFrom(this.layerDataService.getEquipmentsByLayersAndIds(idsLayers)))] 
    }
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyleSummary[]> {
    return this.layerDataService.getAllLayerStyles();
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.layerDataService.getLayerStyleById(layerStyleId);
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Observable<ApiSuccessResponse> {
    return this.layerDataService.createLayerStyle(layerStyle, lyrId).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Observable<ApiSuccessResponse> {
    return this.layerDataService.updateLayerStyle(layerStyle, lseId).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Observable<ApiSuccessResponse> {
    return this.layerDataService.deleteLayerStyle(lseIds).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns An observable that resolves to the layer references.
 */
  public getUserLayerReferences(): Observable<LayerReferences[]> {
    return this.cacheService.fetchReferentialsData<LayerReferences[]>(
      ReferentialCacheKey.LAYER_REFERENCES,
      () => this.layerDataService.getUserLayerReferences()
    );
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }) {
    return this.layerDataService.saveLayerReferencesUser(payload)
      .pipe(
        tap((successResponse: ApiSuccessResponse) => {
          this.utilsService.showSuccessMessage(successResponse.message);
        })
      );
  }

  /**
  * Get all VLayerWtr.
  * @returns A promise that resolves to the list of VLayerWtr.
  */
  public getAllVLayerWtr(): Observable<VLayerWtr[]> {
    return this.cacheService.fetchReferentialsData<VLayerWtr[]>(
      ReferentialCacheKey.V_LAYER_WTR,
      () => this.layerDataService.getAllVLayerWtr()
    );
  }

}
