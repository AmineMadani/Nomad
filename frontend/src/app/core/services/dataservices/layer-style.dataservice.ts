import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable, tap } from 'rxjs';
import { LayerStyle, LayerStyleDetail } from '../../models/layer.model';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { ToastController } from '@ionic/angular';

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
  public getAllLayerStyles(): Observable<LayerStyle[]> {
    return this.http.get<LayerStyle[]>(`${this.configurationService.apiUrl}layer/styles`)
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.http.get<LayerStyleDetail>(`${this.configurationService.apiUrl}layer/styles/${layerStyleId}`)
  }

  public createLayerStyle(layerStyle: LayerStyleDetail) {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles`, layerStyle)
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

  public updateLayerStyle(layerStyle: LayerStyleDetail) {
    return this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles/${layerStyle.lseId}`, layerStyle)
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
