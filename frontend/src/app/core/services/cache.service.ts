import { Injectable } from '@angular/core';
import { AppDB } from '../models/app-db.model';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, from, switchMap, tap, timeout } from 'rxjs';
import { UtilsService } from './utils.service';
import { DownloadState, OfflineDownload } from './offlineDownload.service';
import { PreferenceService } from './preference.service';
import { ConfigurationService } from './configuration.service';
import { NomadGeoJson } from '../models/geojson.model';
import { LayerDataService } from './dataservices/layer.dataservice';

export enum ReferentialCacheKey {
  CITIES = 'cities',
  CONTRACTS = 'contracts',
  LAYERS = 'layers',
  V_LAYER_WTR = 'v_layer_wtr',
  LAYER_INDEX = 'layer_index',
  WORKORDER_TASK_STATUS = 'workorder_task_status',
  WORKORDER_TASK_REASON = 'workorder_task_reason',
  PERMISSIONS = 'permissions',
  FORM_TEMPLATE = 'form_template',
  LAYER_REFERENCES = 'layer_references'
}

export enum CacheKey {
  TILES = 'tiles',
  BASEMAPS = 'basemaps',
  REFERENTIALS = 'referentials',
  WORKORDERS = 'workorders'
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(
    private utilsService: UtilsService,
    private preferenceService: PreferenceService,
    private configurationService: ConfigurationService,
    private layerDataService: LayerDataService
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  public resetCache() {
    // Delete preferences
    for (const key in CacheKey) {
      this.preferenceService.deletePreference(CacheKey[key]);
    }

    // Delete indexed db
    this.db.delete().then(
      () => console.log('Cache réinitialisé')
    ).catch((err) => {
      console.log(`Erreur lors de la réinitialisation : ${err}`)
    });

    // Delete internal cache service with a manual reload
    window.location.reload();
  }

  /**
   * Check if offline mode enable
   */
  public async isCacheDownload(key: CacheKey): Promise<boolean> {
    const downloadState = await this.getCacheDownloadState(key);
    const isDataCached = downloadState?.state === DownloadState.DONE;

    return isDataCached;
  }

  /**
    * Fetches the download state for a specific key from the preferences.
    * If the state is stored in the preferences, it will be parsed and return.
    * If not, a default NOT_STARTED state will be returned.
    *
    * @param {DownloadCacheKey} key - The key to fetch the preference.
    * @returns {Promise<OfflineDownload>} The download state for the given key.
  */
  public async getCacheDownloadState(key: CacheKey): Promise<OfflineDownload> {
    let downloadState = await this.preferenceService.getPreference(key);

    if (downloadState) {
      downloadState = JSON.parse(downloadState) as OfflineDownload;
    } else {
      downloadState = { state: DownloadState.NOT_STARTED };
    }

    return downloadState;
  }

  public setCacheDownloadState(cacheKey: CacheKey, cachedValue: OfflineDownload) {
    this.preferenceService.setPreference(cacheKey, JSON.stringify(cachedValue));
  }

  /**
   * Return all the data for a feature in a layer
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @returns
   */
  public async getPaginatedFeaturesByLayer(
    layerKey: string,
    offset: number,
    limit: number
  ): Promise<any[]> {
    const tiles = await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .offset(offset)
      .limit(limit)
      .toArray();

    let result: any[] = [];
    if (tiles.length > 0) {
      for (let tile of tiles) {
        if (tile.data?.features) {
          result = [
            ...result,
            ...tile.data.features,
          ];
        }
      }
    }

    return result;
  }

  /**
   * Return all the data for a feature in a layer
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @returns
   */
  public async getFeatureByLayerAndFeatureId(
    layerKey: string,
    featureId: string
  ): Promise<any> {
    return await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile?.data?.features?.some(
          (feature) => feature.id.toString() === featureId
        );
      })
      .first((tile) => {
        return tile?.data?.features?.find(
          (feature) => feature.id.toString() === featureId
        );
      });
  }

  /**
   * Return all the feature from a specific layer which have the wanted property
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @param property the property use has a key to search
   * @param value  the value to search
   * @returns List of match feature
   */
  public async getFeatureByLayerAndProperty(
    layerKey: string,
    property: string,
    value: string
  ): Promise<any> {
    const tiles = await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile.data.features?.some(
          (feature) => feature.properties[property].toString() === value
        );
      })
      .toArray();

    let result: any[] = [];
    if (tiles.length > 0) {
      for (let tile of tiles) {
        result = [
          ...result,
          ...tile.data.features?.filter(
            (feature) => feature.properties[property].toString() === value
          ),
        ];
      }
    }

    return result;
  }

  /**
   * Update the feature geometry in cache
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   */
  public updateCacheFeatureGeometry(
    featureId: string,
    layerKey: string,
    newGeometry: number[]
  ) {
    this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile.data.features?.some((feature) => feature.id === featureId);
      })
      .first()
      .then((res) => {
        for (let data of res.data.features) {
          if (data.id.toString() == featureId) {
            data.geometry.coordinates = newGeometry;
            break;
          }
        }

        this.db.tiles
          .where('key')
          .startsWith(layerKey)
          .filter((tile) => {
            return tile.data.features?.some(
              (feature) => feature.id === featureId
            );
          })
          .modify(res);
      });
  }

  public async deleteObject(table: CacheKey, id: string): Promise<void> {
    await this.db.table(table).delete(id);
  }

  /**
   * Fetches referential data either from a local cache or from a service call.
   * If the data is not available in the cache, it will be fetched using the provided service call
   * and then saved to the cache for future access.
   *
   * @param referentialCacheKey - The key used to store and retrieve the data from the local cache.
   * @param serviceCall - A function that returns an Observable which fetches the data when the cache is empty.
   * @returns An Observable of the fetched data, either from the local cache or from the service call.
   */
  public fetchReferentialsData<T>(
    referentialCacheKey: ReferentialCacheKey,
    serviceCall: () => Observable<T>
  ): Observable<T> {
    return from(this.isCacheDownload(CacheKey.REFERENTIALS)).pipe(
      switchMap((isCacheDownload) => {
        if (!isCacheDownload) {
          return serviceCall();
        } else {
          return serviceCall().pipe(
            timeout(this.configurationService.offlineTimeoutReferential),
            tap(async (data) => {
              const isMobile = this.utilsService.isMobilePlateform();
              if (isMobile) {
                await this.db.referentials.put(
                  { data: data, key: referentialCacheKey },
                  referentialCacheKey
                );
              }
            }),
            catchError(async (error) => {
              if (this.utilsService.isOfflineError(error)) {
                const referentials = await this.db.referentials.get(referentialCacheKey);
                if (referentials) {
                  return referentials.data;
                }
              }

              throw error;
            })
          );
        }
      })
    )
  }

  public fetchLayerFile(
    layerKey: string,
    featureNumber: number,
    file: string,
    params: any
  ): Observable<NomadGeoJson> {
    return this.layerDataService.getLayerFile(layerKey, featureNumber, params)
      .pipe(
        timeout(this.configurationService.offlineTimeoutTile),
        tap(async (req: NomadGeoJson) => {
          const isMobile = this.utilsService.isMobilePlateform();

          if (isMobile) {
            await this.db.tiles.put({ data: req, key: file }, file);
          }
        }),
        catchError(async () => {
          const isCacheDownload: boolean = await this.isCacheDownload(CacheKey.TILES);
          if (isCacheDownload) {
            const tile = await this.db.tiles.get(file);
            if (tile) {
              return tile.data;
            }
          }

          throw new Error(`Failed to fetch tile ${featureNumber} for ${layerKey}`);
        })
      );
  }

  public fetchEquipmentsByLayerIds(idsLayers: any): Observable<any> {
    return this.layerDataService.getEquipmentsByLayersAndIds(idsLayers).pipe(
      timeout(this.configurationService.offlineTimeoutEquipment),
      catchError(async () => {
        const isCacheDownload: boolean = await this.isCacheDownload(CacheKey.TILES);
        if (isCacheDownload) {
          let res = [];
          for (const idLayer of idsLayers) {
            for (const ref of idLayer.equipmentIds) {
              const feature = await this.getFeatureByLayerAndFeatureId(idLayer.lyrTableName, ref);
              if (feature) {
                feature.properties = Object.assign(feature.properties, {
                  lyrTableName: idLayer.lyrTableName,
                  geom: feature.geometry
                });
                res.push(feature.properties);
              }
            }
          }
          return res;
        }

        throw new Error(`Failed to fetch the equipments of the following layer ids ${idsLayers}`);
      })
    );
  }


  /**
 * Clear all entries from a table.
 */
  public clearTable(table: CacheKey) {
    this.db[table].clear();
  }

  /**
   * Get the total size of all items in the specified table.
   *
   * @param table - The table to get the size for.
   * @returns {Promise<string>} The total size of the items in the table in "mo" (megabytes).
   */
  public async getTableSize(table: CacheKey): Promise<string> {
    // Fetch all items in the table
    const items = await this.db[table].toArray();

    // Calculate the total size in bytes
    let totalSize = 0;
    for (const item of items) {
      const itemSize = new Blob([JSON.stringify(item)]).size;
      totalSize += itemSize;
    }

    // Convert size to megabytes (Mo)
    const sizeInMo = totalSize / (1024 * 1024);
    return `${sizeInMo.toFixed(2)} mo`;
  }
}
