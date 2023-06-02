/**
 * Context/préférence d'un utilisateur
 */
export class UserContext {
  constructor (currentZoom : number,
              currentLng : number,
              currentLat : number
              ){
    this.zoom  =currentZoom;
    this.lng = currentLng;
    this.lat = currentLat
  }
  public userId : number;
  public zoom : number;
  public userPreferences : string;
  public  lng: number;
	public lat: number;

}
