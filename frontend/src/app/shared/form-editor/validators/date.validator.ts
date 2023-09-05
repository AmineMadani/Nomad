import {Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';
import { DateTime } from 'luxon';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
@Injectable()
export class DateValidator {
  constructor() {
  }
  /**
   * Check the date format (dd/MM/yyyy)
   * @returns : error if date not correctly formatted, else nothing
   */
  static isDateValid(c: FormControl) {
    if (!c.value) return null;
    const date = DateTime.fromFormat(c.value, 'dd/MM/yyyy')
    return date.isValid ? null : { isDateInvalid : true}
  }
  /**
   * Check if end date is posterior to the start date
   * If the 2 dates aren't correctly setted, we don't test
   * @param dateDbt 
   * @param dateFin 
   * @returns error if start date > end date, else nothing
   */
  static compareDateValidator(dateDbt: string, dateFin: string): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
        if (!ctrl.get(dateDbt) || !ctrl.get(dateFin)) {
            return null;
        }
        if (!ctrl.get(dateDbt).value || !ctrl.get(dateFin).value) {
          return null;
        }
        const dateTimeDbt = DateTime.fromFormat(ctrl.get(dateDbt).value, 'dd/MM/yyyy');
        const dateTimeFin = DateTime.fromFormat(ctrl.get(dateFin).value, 'dd/MM/yyyy');
        if (!dateTimeDbt.isValid || !dateTimeFin.isValid) {
          return null;
        }
        return dateTimeDbt <= dateTimeFin ? null : { dateCompareInvalid : true };
    };
  }
}