import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { UserDataService } from './dataservices/user.dataservice';
import { PreferenceService } from './preference.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private preferenceService: PreferenceService,
    private userDataService: UserDataService
  ) { }

  async getUser(): Promise<User | undefined> {
    const user: User | undefined = await this.preferenceService.getPreference('user');
    if(!user) {
      const refreshUser:User = await firstValueFrom(this.userDataService.getUserInformation());
      this.setUser(refreshUser);
      return refreshUser;
    }
    return user;
  }

  setUser(user:User){
    this.preferenceService.setPreference('user',user);
  }

  resetUser(){
    this.preferenceService.deletePreference('user');
  }
}
