import { Injectable } from '@angular/core';
import { AppDB } from '../models/app-db.model';
import { TemplateDataService } from './dataservices/template.dataservice';
import { FormTemplate, FormTemplateUpdate } from '../models/template.model';
import { catchError, of, timeout, lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private templateDataService: TemplateDataService
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  /**
   * Method to get all the forms template
   * @returns list of Forms
   */
  async getFormsTemplate(): Promise<FormTemplate[]> {
    const res = await lastValueFrom(
      this.templateDataService.getFormsTemplate()
        .pipe(
          timeout(2000),
          catchError(async () => {
            const forms = await this.db.referentials.get('formTemplate');
            if (forms) {
              return forms.data;
            }
            return of(null);
          })
        )
    );
    if (!res) {
      throw new Error(`Failed to fetch formTemplate`);
    }

    await this.db.referentials.put(
      { data: res, key: 'formTemplate' },
      'formTemplate'
    );

    return res;
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
}
