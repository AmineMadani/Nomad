import { Injectable } from '@angular/core';
import { AppDB } from '../models/app-db.model';
import { TemplateDataService } from './dataservices/template.dataservice';
import { TemplateForm } from '../models/template.model';
import { catchError, of, timeout, lastValueFrom } from 'rxjs';

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
  async getformsTemplate(): Promise<TemplateForm[]> {
    const res = await lastValueFrom(
      this.templateDataService.getformsTemplate()
        .pipe(
          timeout(2000),
          catchError(async () => {
            const forms = await this.db.referentials.get('templateForms');
            if (forms) {
              return forms.data;
            }
            return of(null);
          })
        )
    );
    if (!res) {
      throw new Error(`Failed to fetch templateForms`);
    }

    await this.db.referentials.put(
      { data: res, key: 'templateForms' },
      'templateForms'
    );

    return res;
  }
}
