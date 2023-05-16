export class MapFeature {
  public id: string;
  public reason: string;
  public status: number;
  public datebegin: Date;
  public dateend: Date;
  public urgent: boolean;
  public appointment: boolean;
  public x: number;
  public y: number;

  constructor() {}

  public static from(obj: any, fromProperties?: boolean): MapFeature {
    let mFeature: MapFeature;
    if (fromProperties) {
      mFeature = new MapFeature()
      mFeature.id = obj['id']?.toString();
      mFeature.reason = obj['wko_name'];
      mFeature.status = obj['wts_id'];
      mFeature.datebegin = obj['wko_planning_start_date'];
      mFeature.dateend = obj['wko_planning_end_date'];
      mFeature.urgent = obj['wko_emergency'];
      mFeature.appointment = obj['wko_appointment'];
      mFeature.x = obj['x'];
      mFeature.y = obj['y'];
      return mFeature;
    } else {
      mFeature = Object.assign(new MapFeature(), obj)
      mFeature.id = mFeature.id?.toString();
      return mFeature;
    }
  }

  public getLabel(): string {
    return `${this.datebegin} - ${this.dateend}`;
  }
}
