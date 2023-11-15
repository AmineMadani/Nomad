import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { DrawerRouteEnum, drawerRoutes } from '../models/drawer.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DateTime } from 'luxon';
import { SearchEquipments } from '../models/layer.model';
import { HttpErrorResponse } from '@angular/common/http';
import { isNumber } from '@turf/turf';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
  ) { }

  /**
   * Check if the current platform is Android.
   * @returns true if the current platform is Android, false otherwise.
   */
  isMobilePlateform(): boolean {
    return this.platform.is('android');
  }

  /**
   * Convert a Map object to a JSON string.
   * @param map The Map object to convert to JSON.
   * @returns The JSON string representing the Map object.
   */
  mapToJson(map: Map<string, string[]> | undefined): string {
    let jsonObject: any = undefined;
    if (map) {
      jsonObject = {};
      map.forEach((value, key) => {
        jsonObject[key] = value;
      });
    }
    return JSON.stringify(jsonObject);
  }

  /**
   * Derialize a Json to a type
   * @param targetInstance destination objevt
   * @param sourceInstance  source object
   * @returns an full filled object
   */
  deserialize(targetInstance: any, sourceInstance: any): any {
    const keys = Object.keys(targetInstance);
    for (const key of keys) {
      if (sourceInstance.hasOwnProperty(key)) {
        targetInstance[key] = sourceInstance[key];
      }
    }
    return targetInstance;
  }

  /**
   * Get the route Enum in DrawerRouteEnum
   * Exemple : /home/asset => return HOME
   * @param url
   * @returns
   */
  public getMainPageName(url: string): string {
    let temp = url.split('/');
    let routePage: string;
    if (url.startsWith('/')) {
      routePage = temp[1];
    } else {
      routePage = temp[0];
    }
    let routeEnumResult: string | undefined = drawerRoutes.find(
      (drawerRoute) =>
        drawerRoute.name.toUpperCase() === routePage.toUpperCase()
    )?.name;
    if (!routeEnumResult) {
      routeEnumResult = routePage.toUpperCase();
    }
    return routeEnumResult;
  }

  /**
   * Get the url of th epage
   * Exemple : HOME return /home
   * @param url
   * @returns
   */
  public getPagePath(name: DrawerRouteEnum): string {
    return drawerRoutes.find(
      (drawerRoute) => drawerRoute.name.toUpperCase() === name
    )?.path;
  }

  public simplifyAssetLabel(inputString: string): string {
    if (!inputString) {
      return '';
    }

    const parts = inputString.split(/\.aep_|\.ass_/);
    const lastPart = parts[parts.length - 1];
    const simplifiedString = lastPart.replace(/_/g, ' ').trim();
    const capitalizedString =
      simplifiedString.charAt(0).toUpperCase() + simplifiedString.slice(1);
    return capitalizedString;
  }

  public transformMap(
    params: Map<string, string>,
    allColumn?: boolean
  ): SearchEquipments[] {
    const filteredEntries = Array.from(params.entries()).filter(
      ([key]) => key.startsWith('aep_') || key.startsWith('ass_')
    );

    const transformedArray = filteredEntries.map(([key, value]) => {
      const equipmentIds = value.split(',');
      return {
        lyrTableName: key,
        equipmentIds: equipmentIds,
        allColumn: allColumn
      };
    });

    return transformedArray;
  }

  public flattenEquipments(
    arr: { lyrTableName: string; equipmentIds: string[] }[]
  ): string[] {
    return arr.reduce(
      (acc: string[], curr: { lyrTableName: string; equipmentIds: string[] }) =>
        acc.concat(curr.equipmentIds),
      []
    );
  }

  public sortMap(map: Map<string, string[]>): { key: string; ids: string[] }[] {
    const mergedMap = new Map<string, string[]>();

    for (const [key, ids] of map.entries()) {
      if (mergedMap.has(key)) {
        const existingIds = mergedMap.get(key);
        if (existingIds) {
          mergedMap.set(key, [...existingIds, ...ids]);
        }
      } else {
        mergedMap.set(key, ids);
      }
    }

    const sortedEntries = Array.from(mergedMap.entries()).sort(
      ([keyA], [keyB]) => keyA.localeCompare(keyB)
    );
    return sortedEntries.map(([key, ids]) => ({ key, ids }));
  }

  public removeDuplicatesFromArr(arr: any[], key: string): any[] {
    return arr.reduce((unique, o) => {
      if (!unique.some((obj) => obj[key] === o[key])) {
        unique.push(o);
      }
      return unique;
    }, []);
  }

  public generateFeatureParams(features: any[]): any {
    const featureParams: any = {};

    features.forEach((feature) => {
      let source = feature.lyrTableName || feature.source;

      if (feature.id.startsWith('TMP-')) {
        source = 'tmp';
      }

      if (!featureParams[source]) {
        featureParams[source] = new Set();
      }

      featureParams[source].add(feature.id);
    });

    // Convert the Sets to comma-separated strings
    Object.keys(featureParams).forEach((source) => {
      featureParams[source] = Array.from(featureParams[source]).join(',');
    });

    return featureParams;
  }

  public generateTaskParams(tasks: any[]): any {
    const taskParams: any = {};
    tasks.forEach((task) => {
      let source = task.assObjTable;
      if (!taskParams[source]) {
        taskParams[source] = new Set();
      }
      taskParams[source].add(task.assObjRef);
    });
    // Convert the Sets to comma-separated strings
    Object.keys(taskParams).forEach((source) => {
      taskParams[source] = Array.from(taskParams[source]).join(',');
    });
    return taskParams;
  }

  public findMostFrequentValue(
    arr: Array<number | string>
  ): number | string | undefined {
    if (arr.length === 0) {
      // Handle the case of an empty array.
      return undefined;
    }

    // Create an object to store the frequency of each value.
    const frequencyMap: { [key: string]: number } = {};

    // Loop through the array and populate the frequencyMap.
    arr.forEach((value) => {
      const key = String(value); // Convert the value to a string to use it as the key.
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    });

    // Find the maximum frequency and corresponding value.
    let mostFrequentValue: number | string | undefined;
    let maxFrequency = 0;
    for (const [value, frequency] of Object.entries(frequencyMap)) {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostFrequentValue = value;
      }
    }

    return mostFrequentValue;
  }

  /**
   * Vaidate all fields of a form
   * @param formGroup FormGroup to validate
   */
  public validateAllFormFields(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);

      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Permit to show a success toast
   * @param message
   */
  public async showSuccessMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: 'success',
      duration: 3000,
      position: 'bottom',
    });

    toast.present();
  }

  /**
   * Permit to show an error toast
   * @param message
   */
  public async showErrorMessage(message: string, duration: number = 1500) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: 'danger',
      duration: duration,
      position: 'bottom',
    });

    toast.present();
  }

  /**
   * convert a date from dd/MM/yyyy to yyyy-MM-dd ISO format
   * @param dateStr : date with dd/MM/yyyy format
   * @returns date ISO
   */
  public convertToDateISO(dateStr: string): Date {
    const dateLuxon: DateTime = DateTime.fromFormat(dateStr, 'dd/MM/yyyy');
    return dateLuxon.toJSDate();
  }

  public convertToDateWithTime(dateStr: string, time: string): Date {
    if (!time) {
      return this.convertToDateISO(dateStr);
    }
    const dateLuxon: DateTime = DateTime.fromFormat(
      dateStr + ' ' + time,
      'dd/MM/yyyy HH:mm'
    );
    return dateLuxon.toJSDate();
  }

    /**
   * 
   * @param num Convert Number of minutes to time HH:MM
   * @returns 
   */
    public convertNumberToTimeString(num : number) : string{
      const hours = Math.floor(num / 60);  
      const minutes = num % 60;
      let hoursString = hours.toString();
      if (hours < 10){
        hoursString = '0' + hoursString;
      }
      let minutesString = minutes.toString();
      if (minutes < 10){
        minutesString = '0' + minutesString;
      }
      return hoursString + ':' + minutesString;
    }
  
    /**
     * Convert the time HH:MM to number of minutes
     * @param value 
     * @returns 
     */
    public convertStringToNumber(value : string) : number{
      if (!value){
        return 0;
      }
      const arraySplit = value.split(':');
      let hours, minutes  : number = 0; 
      if (isNumber(arraySplit[0])){
        hours = Number(arraySplit[0]) * 60;
      }
      if (isNumber(arraySplit[1])){
        minutes = Number(arraySplit[1]);
      }
      return hours + minutes;
    }

  public createCacheId(): number {
    return (
      Number(
        Date.now().toString() + Math.floor(Math.random() * 1000000).toString()
      ) * -1
    );
  }

  public createUniqueId(): number {
    return (
      Number(
        Date.now().toString() + Math.floor(Math.random() * 1000000).toString()
      )
    );
  }

  /**
   * Rounds a number to a specified number of decimal places.
   *
   * @param {number} num - The number to round.
   * @param {number} decimalPlaces - The number of decimal places to round to.
   * @returns {number} The rounded number.
   */
  public roundToDecimalPlaces(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public getAverageOfCoordinates(coordinates: [number, number][]): [number, number] {
    let totalX = 0;
    let totalY = 0;

    // Calculate total x and y coordinates
    coordinates.forEach(c => {
        const [x, y] = c;
        totalX += x;
        totalY += y;
    });

    // Calculate average x and y coordinates
    const averageX = totalX / coordinates.length;
    const averageY = totalY / coordinates.length;

    return [averageX, averageY];
  }

  /**
   * Check if an error is due to a service unavailability.
   * @param error
   * @returns true if it's an offline error, else false
   */
  public isOfflineError(error): boolean {
    console.log(error);
    return error.name === 'TimeoutError' || (error instanceof HttpErrorResponse && (error.status === 0 || !navigator.onLine));
  }

  public fetchPromiseWithTimeout(args: { fetchPromise: Promise<any>, timeout: number }): Promise<any> {
    function handleTimeout(ms) {
          return new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), ms)
        );
      }

    return Promise.race([args.fetchPromise, handleTimeout(args.timeout)]);
  }
}
