/**
 * Context/préférence d'un utilisateur
 */
export class UserContext {
  constructor (currentZoom : number
              ,currentCenter : Array<number>
              ){
    this.zoom  =currentZoom;
    this.center = currentCenter;
  }
  public userId : number;
  public zoom : number;
  public center : Array<number>;
  public userPreferences : string;

}
