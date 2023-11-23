import { Injectable } from '@angular/core';
import { ItvDataService } from './dataservices/itv.dataservice';
import { ItvPictureDto } from '../models/itv.model';

@Injectable({
  providedIn: 'root'
})
export class ItvService {

  constructor(
    private itvDataService: ItvDataService,
  ) {}

  /**
   * Import an ITV file
   * @param file the file
   * @returns the result
   */
  public importItvFile(file: File): Promise<number> {
    return this.itvDataService.importItvFile(file);
  }

  /**
   * Get the list of picture linked to an ITV
   * @param itvId ID of the ITV
   * @returns The list of picture
   */
  public getListItvPictureByItvId(itvId: number): Promise<ItvPictureDto[]> {
    return this.itvDataService.getListItvPictureByItvId(itvId);
  }
}
