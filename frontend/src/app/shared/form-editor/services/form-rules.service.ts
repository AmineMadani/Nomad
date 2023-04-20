import { Injectable } from '@angular/core';
import { ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormRulesService {
  constructor() {}

  // Return ValidationErrors but FromControl dont like it
  createValidators(key: string, value: string | number | boolean): any {
    switch(key) {
      case 'minlength':
        return Validators.minLength(value as number);
      case 'maxlength':
        return Validators.maxLength(value as number);
      case 'required':
        return Validators.required;
      default:
        return Validators.nullValidator;
    }
  }
}
