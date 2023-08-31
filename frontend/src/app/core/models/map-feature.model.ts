export class MapFeature {
  public id: string;
  public reason: string;
  public status: number;
  public datebegin: Date;
  public dateend: Date;
  public urgent: boolean;
  public appointment: boolean;
  public equipmentId: string;
  public lyrTableName: string;
  public wkoId: string;
  public x: number;
  public y: number;

  constructor() { }

  public static from(obj: any): any {
    const mFeature: MapFeature = obj instanceof MapFeature ? obj : Object.assign(new MapFeature(), obj);
    mFeature.id = obj['id']?.toString();
    mFeature.reason = obj['wkoName'];
    mFeature.status = obj['wtsId'];
    mFeature.datebegin = obj['wkoPlanningStartDate'];
    mFeature.dateend = obj['wkoPlanningEndDate'];
    mFeature.urgent = obj['wkoEmergency'];
    mFeature.appointment = obj['wkoAppointment'];
    mFeature.x = obj['longitude'] ? obj['longitude'] : obj['x'];
    mFeature.y = obj['latitude'] ? obj['latitude'] : obj['y'];
    mFeature.wkoId = obj['wkoId'];
    mFeature.equipmentId = mFeature.id?.toString();
    mFeature.id = mFeature.id?.toString();

    return mFeature;
  }

  public getLabel(): string {
    return `${this.datebegin} - ${this.dateend}`;
  }
}
