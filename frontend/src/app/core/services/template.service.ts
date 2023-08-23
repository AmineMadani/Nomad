import { Injectable } from '@angular/core';
import { AppDB } from '../models/app-db.model';
import { TemplateDataService } from './dataservices/template.dataservice';
import { FormTemplate, FormTemplateUpdate } from '../models/template.model';
import { catchError, of, timeout, lastValueFrom, Observable, tap } from 'rxjs';
import { ApiSuccessResponse } from '../models/api-response.model';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private templateDataService: TemplateDataService,
    private toastController: ToastController,
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

  /**
   * Save the custom form template for a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: formTemplate to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveFormTemplateCustomUser(payload: { formTemplate: FormTemplateUpdate, userIds: number[] }) {
    return this.templateDataService.saveFormTemplateCustomUser(payload)
      .pipe(
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
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
        tap(async (successResponse: ApiSuccessResponse) => {
          const toast = await this.toastController.create({
            message: successResponse.message,
            duration: 2000,
            color: 'success'
          });
          await toast.present();
        })
      );
  }
}
