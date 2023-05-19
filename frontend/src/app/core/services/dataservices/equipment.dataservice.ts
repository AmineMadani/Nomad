import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EquipmentDataService {
  constructor(
    private http: HttpClient,
  ) { }

  getById(id: number): Observable<any> {
    return null//this.http.get<any>('method/not/implemented');
  }
}
