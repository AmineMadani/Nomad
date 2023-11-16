import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateTime } from 'luxon';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isNumber } from '@turf/turf';
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

  /**
   * Check the duration of the planning and the duration selected
   * @param dateDbt 
   * @param dateFin 
   * @param heureDbt 
   * @param heureFin 
   * @param duration 
   * @param trigger 
   * @returns error if duration > appointment duration
   */
   static compareTimeDurationValidatorWithTrigger(
    dateDbt: string,
    dateFin: string,
    heureDbt: string,
    heureFin: string,
    duration: string,
    trigger: string
  ): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
      if (!ctrl.get(trigger)?.value) {
        return null;
      }
      if (!ctrl.get(dateDbt) || !ctrl.get(dateFin)) {
        return null;
      }

      if (!ctrl.get(dateDbt).value || !ctrl.get(dateFin).value 
        || !ctrl.get(heureDbt) || !ctrl.get(heureFin) || !ctrl.get(duration)) {
        return null;
      }
      const dateDebut = DateTime.fromFormat(ctrl.get(dateDbt).value, 'dd/MM/yyyy');
      const dateFn = DateTime.fromFormat(ctrl.get(dateFin).value, 'dd/MM/yyyy');
      const dateHeureDebut = DateTime.fromFormat(ctrl.get(heureDbt).value, 'HH:mm');
      const dateHeureFn = DateTime.fromFormat(ctrl.get(heureFin).value, 'HH:mm');
      if (!dateDebut.isValid || !dateFn.isValid || !dateHeureDebut.isValid || !dateHeureFn.isValid) {
        return null;
      }
      const durationCalculated = dateFn.diff(dateDebut).milliseconds + dateHeureFn.diff(dateHeureDebut).milliseconds;
      const durationSelected = this.convertTimeToMillisecond(ctrl.get(duration).value.toString());
      return durationSelected <= durationCalculated ? null : { durationInvalid: true };
    };
  }

  /**
   * Convert Time HH:mm to millisecond
   * @param value 
   * @returns 
   */
  public static convertTimeToMillisecond(value : string) : number{
    const arraySplit = value.split(':');
    let hours, minutes  : number = 0; 
    if (isNumber(arraySplit[0])){
      hours = Number(arraySplit[0]) * 60;
    }
    if (isNumber(arraySplit[1])){
      minutes = Number(arraySplit[1]);
    }
    const numberTime =  hours + minutes;
    return numberTime * 60000;
  }
}
