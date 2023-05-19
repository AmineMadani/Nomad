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

  public static from(obj: any): MapFeature {
    const mFeature: MapFeature =
      obj instanceof MapFeature ? obj : Object.assign(new MapFeature(), obj);
    mFeature.id = mFeature.id.toString();
    return mFeature;
  }

  public getLabel(): string {
    return `${this.datebegin} - ${this.dateend}`;
  }
}
