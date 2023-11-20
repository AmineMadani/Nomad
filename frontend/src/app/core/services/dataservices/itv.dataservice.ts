import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { firstValueFrom } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';

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
   * @returns A response message if successfull, else return an error.
   */
  public importItvFile(file: any): Promise<any> {
    const fd = new FormData();
    fd.append('file', file, file.name);

    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}itv/import`, fd)
    );
  }
}
