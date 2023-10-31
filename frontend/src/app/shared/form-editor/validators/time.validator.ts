import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
@Injectable()
export class TimeValidator {
  constructor() {}
  /**
   * Check the time format (hh:mm)
   * @returns : error if date not correctly formatted, else nothing
   */
  static isHourValid(c: FormControl) {
    if (!c.value) return null;
    const date = DateTime.fromFormat(c.value, 'HH:mm');
    return date.isValid ? null : { isDateInvalid: true };
  }
  /**
   * Check if end hour is posterior to the start date
   * If the 2 hour aren't correctly setted, we don't test
   * @param dateDbt
   * @param dateFin
   * @returns error if start date > end date, else nothing
   */
  static compareTimeValidator(dateDbt: string, dateFin: string): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
      if (!ctrl.get(dateDbt) || !ctrl.get(dateFin)) {
        return null;
      }
      if (!ctrl.get(dateDbt).value || !ctrl.get(dateFin).value) {
        return null;
      }
      const dateTimeDbt = DateTime.fromFormat(ctrl.get(dateDbt).value, 'HH:mm');
      const dateTimeFin = DateTime.fromFormat(ctrl.get(dateFin).value, 'HH:mm');
      if (!dateTimeDbt.isValid || !dateTimeFin.isValid) {
        return null;
      }
      return dateTimeDbt <= dateTimeFin ? null : { TimeCompareInvalid: true };
    };
  }

  /**
   * Check if end hour is posterior to the start date
   * If the 2 hour aren't correctly setted, we don't test
   * @param dateDbt
   * @param dateFin
   * @returns error if start date > end date, else nothing
   */
  static compareTimeValidatorWithTrigger(
    dateDbt: string,
    dateFin: string,
    trigger: string
  ): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
      if (!ctrl.get(trigger)?.value) {
        return null;
      }
      if (!ctrl.get(dateDbt) || !ctrl.get(dateFin)) {
        return null;
      }

      if (!ctrl.get(dateDbt).value || !ctrl.get(dateFin).value) {
        return null;
      }
      const dateTimeDbt = DateTime.fromFormat(ctrl.get(dateDbt).value, 'HH:mm');
      const dateTimeFin = DateTime.fromFormat(ctrl.get(dateFin).value, 'HH:mm');
      if (!dateTimeDbt.isValid || !dateTimeFin.isValid) {
        return null;
      }
      return dateTimeDbt <= dateTimeFin ? null : { timeCompareInvalid: true };
    };
  }
}
