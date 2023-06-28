import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { ConfigurationService } from '../configuration.service';
import { AppDB, layerReferencesKey } from '../../models/app-db.model';
import { LayerReferences, UserReference } from '../../models/layer-references.model';
import { catchError, tap, throwError, timeout } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { ApiErrorResponse, ApiSuccessResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class LayerReferencesDataService {
  private db: AppDB;
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
    private toastController: ToastController
  ) {
    this.db = new AppDB();
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public async getUserLayerReferences(): Promise<LayerReferences[]> {
    // Fetch the layer references from API
    const layerReferencesData: LayerReferences[] = await lastValueFrom(
      this.http.get<LayerReferences[]>(`${this.configurationService.apiUrl}layer/references/user`).pipe(
        timeout(2000),
        catchError(async () => {
          // Get the layer references data from IndexedDB cache
          const layerReferences = await this.db.layerReferences.get(layerReferencesKey);
          // If layer references data exists, return it
          if (layerReferences) {
            return layerReferences.data;
          }
          return null;
        })
      )
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
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A string which contains "CREATED" if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }) {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/references/user`, payload)
      .pipe(
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        }),
        catchError(async (httpErrorResponse: HttpErrorResponse) => {
          const apiError: ApiErrorResponse = httpErrorResponse.error;

          const toast = await this.toastController.create({
            message: apiError.message,
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
          return throwError(() => new Error(apiError.message));
        })
      );
  }
}
