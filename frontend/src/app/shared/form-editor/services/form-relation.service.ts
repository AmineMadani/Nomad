import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormRelation } from '../models/form.model';

@Injectable({
  providedIn: 'root',
})
export class FormRelationService {
  constructor() {}

  setRelation(relations: FormRelation[], form: FormGroup): void {
    if (relations && relations.length > 0) {
      for (const relation of relations) {
        switch (relation.relation) {
          case 'enableAfter':
            form.get(relation.relatedFrom)?.disable({ emitEvent: false });
            break;
        }
      }
    }
  }

  checkRelation(relations: FormRelation[], form: FormGroup): void {
    if (relations && relations.length > 0) {
      for (const relation of relations) {
        switch (relation.relation) {
          case 'enableAfter':
            if (form.get(relation.relatedTo)?.dirty && form.get(relation.relatedFrom)?.disabled) {
              form.get(relation.relatedFrom)?.enable();
            }
            break;
        }
      }
    }
  }
}
