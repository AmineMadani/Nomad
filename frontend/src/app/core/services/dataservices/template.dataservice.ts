import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, lastValueFrom, of, timeout } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { TemplateForm } from '../../models/template.model';
import { AppDB } from '../../models/app-db.model';
import { TIMEOUT } from 'dns';

@Injectable({
  providedIn: 'root',
})
export class TemplateDataService {

  private db: AppDB;

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {
    this.db = new AppDB();
  }

  /**
   * Method to get all the forms template
   * @returns list of Forms
   */
  async getformsTemplate(): Promise<TemplateForm[]> {

    const res = await lastValueFrom(
      this.http.get<TemplateForm[]>(`${this.configurationService.apiUrl}template/forms`).pipe(
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

    await this.db.referentials.put({ data: res, key: 'templateForms' }, 'templateForms');

    return res;
  }
}


