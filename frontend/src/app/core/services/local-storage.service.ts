import { Injectable } from '@angular/core';
import { UserDataService } from './dataservices/user.dataservice';
import { PreferenceService } from './preference.service';
import { UserContext } from '../models/user-context.model';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
/**
 * Enum of cache items in local storage
 */
export enum LocalStorageKey {
  USER = 'user',
  USER_CONTEXT = 'userContext'
  }

@Injectable({
  providedIn: 'root'
})

/**
 * Service of Local Storage
 */
export class LocalStorageService {

  constructor(
    private preferenceService: PreferenceService,
    private userDataService : UserDataService
    
  ) { }

}
