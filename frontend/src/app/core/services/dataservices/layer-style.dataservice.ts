import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable, tap } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { ToastController } from '@ionic/angular';
import { LayerStyleDetail, LayerStyleSummary, SaveLayerStylePayload } from '../../models/layer-style.model';

@Injectable({
  providedIn: 'root',
})
export class LayerStyleDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
    private toastController: ToastController
  ) { }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyleSummary[]> {
    return this.http.get<LayerStyleSummary[]>(`${this.configurationService.apiUrl}layer/styles`)
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.http.get<LayerStyleDetail>(`${this.configurationService.apiUrl}layer/styles/${layerStyleId}`)
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number) {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/${lyrId}/styles`, layerStyle)
      .pipe(
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        })
      );
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number) {
    return this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles/${lseId}`, layerStyle)
      .pipe(
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        })
      );
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseId: number) {
    return this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles/${lseId}`)
      .pipe(
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        })
      );
  }
}
