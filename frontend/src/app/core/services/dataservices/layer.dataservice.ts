import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { ConfigurationService } from '../configuration.service';
import { AppDB } from '../../models/app-db.model';
import { GeoJSONObject } from '../../models/geojson.model';
import { LayerReferencesService } from '../layer-reference.service';

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
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req = await lastValueFrom(
      this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layer/${layerKey}`)
    );
    if (!req) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }
    await this.db.indexes.put({ data: req, key: layerKey }, layerKey);
    return req;
  }

  /**
    * Fetches the tile of a layer from indexed db if present or server.
    * If successful, stores the layer's file in IndexedDB.
    * @param {string} layerKey - Key of the layer.
    * @param {string} file - The file where the view is.
    * @returns The GeoJSON file for the current tile.
  */
  public async getLayerFile(layerKey: string, file: string): Promise<GeoJSONObject> {
    // Check if the tile exists in IndexedDB.
    const tile = await this.db.tiles.get(file);
    if (tile) {
      return tile.data;
    }

    // Get the feature number from the file name.
    const featureNumber: number = +file.match(new RegExp(`${layerKey}_(\\d+)\\.geojson`))![1];

    // Fetch the GeoJSON file from the server.
    const req = await lastValueFrom(
      this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layer/${layerKey}/${featureNumber}`)
    );

    // Throw an error if the request failed.
    if (!req) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }

    // Store the tile in IndexedDB.
    await this.db.tiles.put({ data: req, key: file }, file);

    // Return the GeoJSON file.
    return req;
  }

  public getLayerStyle(layerKey: string): Observable<any> {
    return this.http.get('./assets/sample/canalisation_style.json');
  }
}
