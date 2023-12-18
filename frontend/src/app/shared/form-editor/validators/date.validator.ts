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
    return DateValidator.isDateValueValid(c.value) ? null : { isDateInvalid : true}
  }

    /**
   * Check if string value is Date and valid date
   * @param value 
   * @returns 
   */
    static isDate(value : string) : boolean {
      return Date.parse(value) > 0 && !isNaN(Date.parse(value)) && DateValidator.isDateValueValid(value);
    }
  
  /**
   * Check if date exists (consider leap year)
   * eg 31/09/2023 ko
   * @param val 
   * @returns 
   */
  static isDateValueValid(val: any): boolean {
    if (val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const date = DateTime.fromFormat(val, 'dd/MM/yyyy')
      // if input formatted dd/MM/yyyy, check if date exists
      return date.isValid;
    }
    else {
      //min 1/1/24 max 01/01/2024
      if (val.length < 5 || val.length > 10) {
        return false;
      }
      return true;
    }
  }

  /**
   * if the key pressed is valid for date input
   * @param event : key pressed
   * @param oldValue : old date value
   * @returns 
   */
  static isKeyValid(event: any, oldValue: string): boolean {
    const numericRegex = /[0-9\+\-\ ]/;
    if (!numericRegex.test(event.key) && event.key !== 'Shift' && event.key !== 'Backspace' &&
                                             event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return false;
    }
    else if (numericRegex.test(event.key) && event.target.value.length >= 10) {
      return false;
    }
    return true;
  }

  /**
   * Force the input date in dd/MM/yyyy format
   * manage the / delimiters
   * check if day btw 1 and 31, month btw 1 and 12
   * and if date is valid
   * @param event : key pressed
   * @param oldValue : old date value
   * @returns 
   */
  static formatDate(event: any, oldValue: string): string {
    let newValue = event.target.value;
    if (!DateValidator.isDateValueValid(newValue)) {
      return oldValue; // cancel invalid input
    }
    else {
      if (newValue.length == 1) {
        var num = Number(newValue);
        if (num > 3) newValue = "0" + newValue;
      }
      if (newValue.length == 2) {
        var num = Number(newValue);
        if (num > 31) newValue = "31";
      }
      if (newValue.length == 4) {
        var num = Number(newValue.slice(-1));
        if (num > 1) newValue = newValue.slice(0, 3) + "0" + newValue.slice(-1);
      }
      if (newValue.length == 5) {
        var num = Number(newValue.slice(-2));
        if (num > 12) newValue = newValue.slice(0, 3) + "12";
      }
      if (newValue.length == 2 || (newValue.length == 5 && newValue.split("/").length - 1 < 2)) {
        newValue += '/';
      }
      return newValue;
    }
  }

  /**
   * Convert Date to format dd/MM/yyyy
   * @param dateString 
   * @returns 
   */
    public static convertFormatDateFr(dateString: string): string {
      const date = new Date(dateString);
      const formattedDate = new Intl.DateTimeFormat('fr-FR').format(date);
      return formattedDate;
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