export class MapFeature {
  public id: string;
  public reason: string;
  public status: number;
  public datebegin: Date;
  public dateend: Date;
  public urgent: boolean;
  public appointment: boolean;
  public equipmentId: string;
  public lyr_table_name: string;
  public x: number;
  public y: number;

  constructor() { }

  public static from(obj: any): any {
    const mFeature: MapFeature = obj instanceof MapFeature ? obj : Object.assign(new MapFeature(), obj);
    mFeature.id = obj['id']?.toString();
    mFeature.reason = obj['wko_name'];
    mFeature.status = obj['wts_id'];
    mFeature.datebegin = obj['wko_planning_start_date'];
    mFeature.dateend = obj['wko_planning_end_date'];
    mFeature.urgent = obj['wko_emergency'];
    mFeature.appointment = obj['wko_appointment'];
    mFeature.x = obj['longitude'] ? obj['longitude'] : obj['x'];
    mFeature.y = obj['latitude'] ? obj['latitude'] : obj['y'];
    mFeature.equipmentId = mFeature.id?.toString();
    mFeature.id = mFeature.id?.toString();

    return mFeature;
  }

  public getLabel(): string {
    return `${this.datebegin} - ${this.dateend}`;
  }
}
