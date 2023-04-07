export enum InterventionStatusEnum {
  T = 'T', //Terminée
  I = 'I', // Infructueuse
  P = 'P', // Planifiée
  NP = 'NP', // Non planifiée
  NF = 'NF', // Non fait
}

export class MapFeature {
  public id: string;
  public reason: string;
  public status: InterventionStatusEnum;
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
      mFeature.id = obj['id'].toString();
      mFeature.reason = obj['reason'];
      mFeature.status = obj['status'];
      mFeature.datebegin = obj['datebegin'];
      mFeature.dateend = obj['dateend'];
      mFeature.urgent = obj['urgent'];
      mFeature.appointment = obj['appointment'];
      mFeature.x = obj['id'];
      mFeature.y = obj['id'];
      return mFeature;
    } else {
      mFeature = Object.assign(new MapFeature(), obj)
      mFeature.id = mFeature.id.toString();
      return mFeature;
    }
  }

  public getLabel(): string {
    return `${this.datebegin} - ${this.dateend}`;
  }

  public getStatusIcon(): string {
    switch (this.status) {
      case InterventionStatusEnum.NF:
        return 'checkmark';
      case InterventionStatusEnum.I:
        return 'close';
      case InterventionStatusEnum.P:
      case InterventionStatusEnum.NP:
        return 'calendar';
      case InterventionStatusEnum.T:
        return 'checkmark-done';
      default:
        return '';
    }
  }

  public getStatusLabel(): string {
    switch (this.status) {
      case InterventionStatusEnum.NF:
        return 'Non fait';
      case InterventionStatusEnum.I:
        return 'Infructueuse';
      case InterventionStatusEnum.P:
        return 'Planifiée';
      case InterventionStatusEnum.NP:
        return 'Non Planifiée';
      case InterventionStatusEnum.T:
        return 'Terminée';
      default:
        return '';
    }
  }
}
