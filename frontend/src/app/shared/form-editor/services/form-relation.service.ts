import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormRelation } from '../models/form.model';

@Injectable({
  providedIn: 'root',
})
export class FormRelationService {
  constructor() {}

  /**
   * The function disables a form control based on a specified relation.
   * @param {FormRelation[]} relations - An array of FormRelation objects that contain information about
   * the relationship between form controls.
   * @param {FormGroup} form - FormGroup object that represents a form in Angular. It contains
   * FormControls, which are used to track the value and validation status of individual form controls.
   */
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

  /**
   * Function checks a list of relations and enables a form control if a specific condition is met.
   * @param {FormRelation[]} relations - An array of FormRelation objects that define the relationship
   * @param {FormGroup} form - FormGroup object that represents a form in Angular.
   */
  checkRelation(relations: FormRelation[], form: FormGroup): void {
    if (relations && relations.length > 0) {
      for (const relation of relations) {
        switch (relation.relation) {
          case 'enableAfter':
            if (
              form.get(relation.relatedTo)?.dirty &&
              form.get(relation.relatedFrom)?.disabled
            ) {
              form.get(relation.relatedFrom)?.enable();
            }
            break;
        }
      }
    }
  }
}
