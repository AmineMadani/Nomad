/**
 * class to store  User's context and preferences
 */
export class UserContext {
  constructor (){
  }

  public userId : number;
  public zoom : number;
  public userPreferences : string;
  public lng: number;
	public lat: number;

  // public route : string;
  // public pathVariable : any[];
  // public queryParams : any;
  public url : string;
  
}
