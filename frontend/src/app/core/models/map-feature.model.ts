export enum InterventionStatusEnum {
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE',
  PLANIFIE = 'PLANIFIE',
  ENVOYEPLANIF = 'ENVOYEPLANIF',
  CREE = 'CREE',
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
      mFeature.id = obj['id']?.toString();
      mFeature.reason = obj['reason'];
      mFeature.status = obj['status'];
      mFeature.datebegin = obj['datebegin'];
      mFeature.dateend = obj['dateend'];
      mFeature.urgent = obj['urgent'];
      mFeature.appointment = obj['appointment'];
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

  public getStatusIcon(): string {
    switch (this.status) {
      case InterventionStatusEnum.CREE:
        return 'checkmark';
      case InterventionStatusEnum.ANNULE:
        return 'close';
      case InterventionStatusEnum.ENVOYEPLANIF:
      case InterventionStatusEnum.PLANIFIE:
        return 'calendar';
      case InterventionStatusEnum.TERMINE:
        return 'checkmark-done';
      default:
        return '';
    }
  }

  public getStatusLabel(): string {
    switch (this.status) {
      case InterventionStatusEnum.CREE:
        return 'Créé';
      case InterventionStatusEnum.ANNULE:
        return 'Annulé';
      case InterventionStatusEnum.PLANIFIE:
        return 'Planifiée';
      case InterventionStatusEnum.ENVOYEPLANIF:
        return 'Envoyé à la planification';
      case InterventionStatusEnum.TERMINE:
        return 'Terminée';
      default:
        return '';
    }
  }
}
