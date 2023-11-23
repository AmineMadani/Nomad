import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { firstValueFrom } from 'rxjs';
import { ItvPictureDto } from '../../models/itv.model';

@Injectable({
  providedIn: 'root',
})
export class ItvDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * Import an ITV file
   * @param file the file
   * @returns The id of the ITV created
   */
  public importItvFile(file: File): Promise<number> {
    const fd = new FormData();
    fd.append('file', file, file.name);

    return firstValueFrom(
      this.http.post<number>(`${this.configurationService.apiUrl}itv/import`, fd)
    );
  }

  /**
   * Get the list of picture linked to an ITV
   * @param itvId ID of the ITV
   * @returns The list of picture
   */
  public getListItvPictureByItvId(itvId: number): Promise<ItvPictureDto[]> {
    return firstValueFrom(
      this.http.get<ItvPictureDto[]>(`${this.configurationService.apiUrl}itv/${itvId}/picture`)
    );
  }
}
