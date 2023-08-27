import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { FormTemplate, FormTemplateUpdate } from '../../models/template.model';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../../models/api-response.model';

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
    return this.http.get<FormTemplate[]>(`${this.configurationService.apiUrl}templates/forms`)
  }

  public createFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.http.post<any>(
      `${this.configurationService.apiUrl}templates/create`,
      formTemplate,
      this.httpOptions
    );
  }

  public updateFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.http.put<any>(
      `${this.configurationService.apiUrl}templates/update`,
      formTemplate,
      this.httpOptions
    );
  }

  /**
   * Save the custom form template for a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: formTemplate to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveFormTemplateCustomUser(payload: { formTemplate: FormTemplateUpdate, userIds: number[] }):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}templates/custom/users`, payload);
  }

  /**
   * Delete the custom form template for a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: id of the default template form and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public deleteFormTemplateCustomUser(payload: { id: number, userIds: number[] }):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}templates/custom/users/delete`, payload);
  }
}


