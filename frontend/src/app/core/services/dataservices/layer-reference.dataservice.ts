import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { ConfigurationService } from '../configuration.service';
import { AppDB, layerReferencesKey } from '../../models/app-db.model';
import { LayerReferences, UserReference } from '../../models/layer-references.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayerReferencesDataService {
  private db: AppDB;
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {
    this.db = new AppDB();
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public async getUserLayerReferences(): Promise<LayerReferences[]> {
    // Get the layer references data from IndexedDB cache
    const layerReferences = await this.db.layerReferences.get(layerReferencesKey);
    // If layer references data exists, return it
    if (layerReferences) {
      return layerReferences.data;
    }

    // If layer references data doesn't exist in IndexedDB, fetch from API
    const layerReferencesData = await lastValueFrom(
      this.http.get<LayerReferences[]>(`${this.configurationService.apiUrl}layer/references/user`)
    );

    // Check if layer references data was fetched successfully
    if (!layerReferencesData) {
      throw new Error(`Failed to fetch the layer references for the current user`);
    }

    // Store layer references data in IndexedDB
    await this.db.layerReferences.put({ data: layerReferencesData, key: layerReferencesKey }, layerReferencesKey);

    // Return the layer references data fetched from the API
    return layerReferencesData;
  }

  /**
 * Gets the user references for a user by a lyrTableName.
 * @param userId The ID of the user to get the user references for.
 * @param lyrTableName The layer name to get the user references.
 * @returns A promise that resolves to the user references.
 */
  public getUserLayerReferencesByLyrTableName(lyrTableName: string): Observable<UserReference[]> {
    return this.http.get<UserReference[]>(`${this.configurationService.apiUrl}layer/references/user/layer/${lyrTableName}`);
  }

  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: any }) {
    return this.http.post<number>(`${this.configurationService.apiUrl}layer/references/user`, payload);
  }
}
