import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
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

  /**
   * Export an empty ITV file, filed with the selected assets
   * @param listAsset List of asset (lyrTableName + asset id) of the selected assets
   * @param fileType Type of file (TXT or XML)
   * @returns The ITV file
   */
  public exportEmptyItvFile(listAsset: any[], fileType: string): Promise<any> {
    const data = {
      listAsset,
      fileType
    }

    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.configurationService.apiUrl}itv/export`, data, {
        observe: 'response',
        responseType: 'blob' as 'json'
      }).subscribe((resp: HttpResponse<Blob>) => {
        const contentDisposition = resp.headers.get('Content-Disposition');
        resolve({content: resp.body, fileName: this.extractFileName(contentDisposition)});
      });
    });
  }

  extractFileName(contentDisposition: string):string{
    let fileName = 'file';
    if (contentDisposition) {
      const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = fileNameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
      }
    }
    return fileName;        
  }
}
