import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { sections } from 'src/app/pages/home/drawers/equipment/equipment-drawer.dataset';
import {
  Equipment,
  Section,
} from 'src/app/pages/home/drawers/equipment/equipment-drawer.model';

@Injectable({
  providedIn: 'root',
})
export class EquipmentDataService {
  constructor(private http: HttpClient) {}

  getSections(): Section[] {
    return sections;
  }

  getById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>('method/not/implemented');
  }
}
