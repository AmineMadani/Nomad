import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { ConfigurationService } from '../configuration.service';
import { AppDB } from '../../models/app-db.model';
import { GeoJSONObject, NomadGeoJson } from '../../models/geojson.model';
import { Layer } from '../../models/layer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerDataService {

  private db: AppDB;

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {
    this.db = new AppDB();
  }

  private listIndexOnLoad: Map<string,string> = new Map<string,string>;
  private listTileOnLoad: Map<string,string> = new Map<string,string>;

  /**
   * It fetches the index of a layer from indexed db if present or server
   * If successful, it stores the layer in IndexedDB.
   * @param {string} layerKey - string - key of the layer
   * @returns The geojson of the index of the layer.
   */
  public async getLayerIndex(layerKey: string): Promise<GeoJSONObject> {
    const index = await this.db.indexes.get(layerKey);
    if (index) {
      return index.data;
    }
    if(!this.listIndexOnLoad.has(layerKey)) {
      this.listIndexOnLoad.set(layerKey,"Chargement des indexes de la couche "+layerKey);
      /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
      const req = await firstValueFrom(
        this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layer/${layerKey}`)
      );
      if (!req) {
        throw new Error(`Failed to fetch index for ${layerKey}`);
      }
      await this.db.indexes.put({ data: req, key: layerKey }, layerKey);
      this.listIndexOnLoad.delete(layerKey);
      return req;
    }
    return {};
  }

  /**
    * Fetches the tile of a layer from indexed db if present or server.
    * If successful, stores the layer's file in IndexedDB.
    * @param {string} layerKey - Key of the layer.
    * @param {string} file - The file where the view is.
    * @returns The GeoJSON file for the current tile.
  */
  public async getLayerFile(layerKey: string, file: string): Promise<NomadGeoJson> {
    const tile = await this.db.tiles.get(file);
    if (tile) {
      return tile.data;
    }
    this.listTileOnLoad.set(layerKey,"Chargement de la couche "+layerKey);
    /* It's getting the number from the file name. */
    const featureNumber: number = +file.match(
      new RegExp(`${layerKey}_(\\d+)\\.geojson`)
    )![1];
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req = await lastValueFrom(
      this.http.get<NomadGeoJson>(
        `${this.configurationService.apiUrl}layer/${layerKey}/${featureNumber}`
      )
    );
    if (!req) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }

    if(layerKey != 'workorder') {
      await this.db.tiles.put({ data: req, key: file }, file);
    }

    this.listTileOnLoad.delete(layerKey);
    return req;
  }

  public getLayerStyle(layerKey: string): Observable<any> {
    return this.http.get('./assets/sample/canalisation_style.json');
  }

  /**
   * Method to know if layer data is currently loading from the server
   * @returns true is data is currently loading
   */
  public isDataLoading(): boolean {
    return (this.listTileOnLoad.size > 0 || this.listIndexOnLoad.size > 0)
  }

  /**
   * Method to get the list of layer currently loading from server (index or tile)
   * @returns The list of layer currently loading
   */
  public getListLoadingData(): string[] {
    return [ ...Array.from(this.listIndexOnLoad.values()), ...Array.from(this.listTileOnLoad.values())];
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public async getLayers() : Promise<Layer[]>{
    const layers = await this.db.referentials.get('layers');
    if (layers) {
      return layers.data;
    }

    const res = await lastValueFrom(
      this.http.get<Layer[]>(`${this.configurationService.apiUrl}layer/default/definitions`)
    );
    if (!res) {
      throw new Error(`Failed to fetch layers`);
    }

    await this.db.referentials.put({ data: res, key: 'layers' }, 'layers');

    return res;
  }

  /**
   * Method to get an equipment from a layer
   * @param layer the layer
   * @param id the id
   * @returns the equipment
   */
  getEquipmentByLayerAndId(layer:string, id: number): Observable<any> {
    return this.http.get<any>(`${this.configurationService.apiUrl}layer/`+layer+`/equipment/`+id);
  }
}
