import { Injectable } from '@angular/core';
import { ItvDataService } from './dataservices/itv.dataservice';

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
  public importItvFile(file: File): Promise<any> {
    return this.itvDataService.importItvFile(file);
  }
}
