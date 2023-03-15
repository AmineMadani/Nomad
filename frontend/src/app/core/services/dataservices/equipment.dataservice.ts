import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { sections } from 'src/app/core/mocks/equipment/equipment-section.mock';
import { actionButtons } from '../../mocks/equipment/equipment-action-buttons.mock';
import {
  Equipment,
  EquipmentActionButton,
  EquipmentSection,
} from 'src/app/core/models/equipment.model';

@Injectable({
  providedIn: 'root',
})
export class EquipmentDataService {
  constructor(private http: HttpClient) {}

  getSections(): EquipmentSection[] {
    const sectionList = sections;

    // Sort the main list by position
    sectionList.sort((a, b) => a.position - b.position);

    // Sort the elements arrays inside each object by position
    sectionList.forEach(item => {
      item.elements.sort((a, b) => a.position - b.position);
    });

    return sections;
  }

  getActionButtons(): EquipmentActionButton[] {
    const buttonList = actionButtons;

    // Sort the list by position
    buttonList.sort((a, b) => a.position - b.position);

    return buttonList;
  }

  getById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>('method/not/implemented');
  }
}
