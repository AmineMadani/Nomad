import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { TemplateForm } from '../../models/template.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TemplateDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {
  }

  /**
   * Method to get all the forms template
   * @returns list of Forms
   */
  public getformsTemplate(): Observable<TemplateForm[]> {
    return this.http.get<TemplateForm[]>(`${this.configurationService.apiUrl}template/forms`)
  }
}


