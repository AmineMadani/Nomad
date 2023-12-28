import { Injectable } from '@angular/core';
import { ItvDataService } from './dataservices/itv.dataservice';
import { Itv, ItvPictureDto } from '../models/itv.model';
import saveAs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ItvService {

  constructor(
    private itvDataService: ItvDataService,
  ) {}

  public async getItvsPaginated(limit: number, offset: number, search: any): Promise<Itv[]> {
    return this.itvDataService.getItvsPaginated(limit, offset, search);
  }

  /**
   * Import an ITV file
   * @param file the file
   * @returns the result
   */
  public importItvFile(file: File): Promise<number> {
    return this.itvDataService.importItvFile(file);
  }

  /**
   * Delete an ITV
   * @param itvId ID of the ITV
   */
  public deleteItv(itvId: number): Promise<void> {
    return this.itvDataService.deleteItv(itvId);
  }

  /**
   * Get the list of picture linked to an ITV
   * @param itvId ID of the ITV
   * @returns The list of picture
   */
  public getListItvPictureByItvId(itvId: number): Promise<ItvPictureDto[]> {
    return this.itvDataService.getListItvPictureByItvId(itvId);
  }

  /**
   * Update the list of picture linked to an ITV to set the attachment id
   * @param itvId ID of the ITV
   * @param listItvPicture List of ITV picture to update
   * @returns The list of picture of the ITV
   */
  public updateListItvPicture(itvId: number, listItvPicture: ItvPictureDto[]): Promise<ItvPictureDto[]> {
    return this.itvDataService.updateListItvPicture(itvId, listItvPicture);
  }

  /**
   * Get the list of task linked to an ITV
   * @param itvId ID of the ITV
   * @returns The list of task
   */
  public getListTaskByItvId(itvId: number): Promise<Task[]> {
    return this.itvDataService.getListTaskByItvId(itvId);
  }

  /**
   * Export an empty ITV file, filed with the selected assets
   * @param listAsset List of asset (lyrTableName + asset id) of the selected assets
   * @param fileType Type of file (TXT or XML)
   * @returns The ITV file
   */
  public async exportEmptyItvFile(listAsset: any[], fileType: string): Promise<void> {
    const itv = await this.itvDataService.exportEmptyItvFile(listAsset, fileType);
    saveAs(itv.content, itv.fileName);
  }
}
