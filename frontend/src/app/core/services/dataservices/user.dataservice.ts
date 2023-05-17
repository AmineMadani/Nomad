import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { ConfigurationService } from '../configuration.service';
import { UserContext } from '../../models/user-context.model';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {}

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  getUserInformation(): Observable<User> {
    return this.http.get<User>(`${this.configurationService.apiUrl}user/information`);
  }
  /**
   * Sauvegarde en Bdd les préférences de l'utilisateur
   * @param userContext : contenu des préférence de l'utilisateur
   */
  public saveUsercontext(userContext : UserContext) : void {
    this.http.put(`${this.configurationService.apiUrl}user/user-context/${userContext.userId}`, userContext).subscribe({
    //next : () => ,
    error : (err) => console.error(err)
    })
  }
}


