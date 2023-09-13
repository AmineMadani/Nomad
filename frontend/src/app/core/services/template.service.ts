import { Injectable } from '@angular/core';
import { AppDB } from '../models/app-db.model';
import { TemplateDataService } from './dataservices/template.dataservice';
import { FormTemplate, FormTemplateUpdate } from '../models/template.model';
import { catchError, of, timeout, lastValueFrom, Observable, tap } from 'rxjs';
import { ApiSuccessResponse } from '../models/api-response.model';
import { UtilsService } from './utils.service';
import { ConfigurationService } from './configuration.service';
import { CacheService, ReferentialCacheKey } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private templateDataService: TemplateDataService,
    private utilsService: UtilsService,
    private cacheService: CacheService
  ) {
  }

  /**
   * Method to get all the forms template
   * @returns list of Forms
   */
  getFormsTemplate(): Observable<FormTemplate[]> {
    return this.cacheService.fetchReferentialsData<FormTemplate[]>(
      ReferentialCacheKey.FORM_TEMPLATE,
      () => this.templateDataService.getFormsTemplate()
    );
  }

  /**
   * Create a form template
   * @param formTemplate the form template to create
   * @returns the form template
   */
  public createFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.templateDataService.createFormTemplate(formTemplate);
  }

  /**
   * Update a form template
   * @param formTemplate the form template to update
   * @returns the form template
   */
  public updateFormTemplate(formTemplate: FormTemplateUpdate): Observable<any> {
    return this.templateDataService.updateFormTemplate(formTemplate);
  }

  /**
   * Save the custom form template for a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: formTemplate to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveFormTemplateCustomUser(payload: { formTemplate: FormTemplateUpdate, userIds: number[] }) {
    return this.templateDataService.saveFormTemplateCustomUser(payload)
      .pipe(
        tap((successResponse: ApiSuccessResponse) => {
          this.utilsService.showSuccessMessage(successResponse.message);
        })
      );
  }

  /**
   * Delete the custom form template for a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: id of the default template form and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public deleteFormTemplateCustomUser(payload: { id: number, userIds: number[] }) {
    return this.templateDataService.deleteFormTemplateCustomUser(payload)
      .pipe(
        tap((successResponse: ApiSuccessResponse) => {
          this.utilsService.showSuccessMessage(successResponse.message);
        })
      );
  }
}
