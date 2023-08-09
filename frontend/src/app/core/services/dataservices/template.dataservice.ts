import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { FormTemplate, FormTemplateUpdate } from '../../models/template.model';
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

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**
   * Method to get all the forms template
   * @returns list of Forms
   */
  public getFormsTemplate(): Observable<FormTemplate[]> {
    return this.http.get<FormTemplate[]>(`${this.configurationService.apiUrl}template/forms`)
  }

  public createFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.http.post<any>(
      `${this.configurationService.apiUrl}template/create`,
      formTemplate,
      this.httpOptions
    );
  }

  public updateFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.http.put<any>(
      `${this.configurationService.apiUrl}template/update`,
      formTemplate,
      this.httpOptions
    );
  }
}


