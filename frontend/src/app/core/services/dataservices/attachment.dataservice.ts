import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Observable } from 'rxjs';
import { Attachment } from '../../models/attachment.model';

@Injectable({
  providedIn: 'root',
})
export class AttachmentDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * Method to get all the attachments for a workorder
   * @returns list of Attachment
   */
  public getListAttachmentByWorkorderId(workorderId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.configurationService.externalApiUrl}attachment/workorder/${workorderId}`)
  }

  /**
   * Method to add an attachment for a workorder
   * @returns Attachment
   */
  public addAttachment(workorderId: number, file: File): Observable<Attachment> {
    const fd = new FormData();
    fd.append('file', file, file.name);

    return this.http.post<Attachment>(`${this.configurationService.externalApiUrl}attachment/workorder/${workorderId}`, fd)
  }
}

