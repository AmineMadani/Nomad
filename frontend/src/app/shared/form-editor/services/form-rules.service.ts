import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root',
})
export class FormRulesService {
  constructor() { }

  // Return ValidationErrors but FromControl dont like it
  createValidators(key: string, value: string | number | boolean, message: string): any {
    switch (key) {
      case 'minlength':
        return Validators.minLength(value as number);
      case 'maxlength':
        return Validators.maxLength(value as number);
      case 'required':
        return Validators.required;
      case 'dateformat':
        return dateformat(value as string, message);
      default:
        return Validators.nullValidator;
    }
  }
}

export function dateformat(value: string, message: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let val: DateTime = DateTime.fromFormat(control.value, value);
    if (val.isValid || control.value?.length === 0) {
      return null;
    } else {
      return { wrongDateFormat: message }
    }
  }
}
