import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DrawerRouteEnum, drawerRoutes } from '../models/drawer.model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private platform: Platform) {}

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

  public transformMap(map: Map<string, string>): { lyrTableName: string, equipmentIds: string[] }[] {
    const result: { lyrTableName: string, equipmentIds: string[] }[] = [];
  
    map.forEach((value, key) => {
      const params = new URLSearchParams(value);
      const lyrTableName = params.get('lyr_table_name');
  
      if (lyrTableName) {
        const existingEntry = result.find(entry => entry.lyrTableName === lyrTableName);
  
        if (existingEntry) {
          existingEntry.equipmentIds.push(params.get('id') || '');
        } else {
          result.push({
            lyrTableName: lyrTableName,
            equipmentIds: [params.get('id') || '']
          });
        }
      }
    });
  
    return result;
  }

  public sortMap(map: Map<string, string[]>): { key: string, ids: string[] }[] {
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
  
    const sortedEntries = Array.from(mergedMap.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    return sortedEntries.map(([key, ids]) => ({ key, ids }));
  }
}
