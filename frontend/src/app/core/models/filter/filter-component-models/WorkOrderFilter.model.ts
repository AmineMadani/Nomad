import { BaseFilterData, BaseFilter } from './BaseFilter.model';

export class WorkOrderFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public type: 'workorder' | 'demande';
  public data: WorkOrderData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    type: 'workorder' | 'demande', 
    data: WorkOrderData[]
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.type = type;
    this.data = data;
  }

  isSelectedData(): boolean {
    throw new Error('Method not implemented.');
  }

  getType(): string {
    return 'workOrderFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data = null as any;
    }
  }
}

export interface WorkOrderData extends BaseFilterData {
  isIntervention?: boolean;
  subtitle?: string;
  content?: string;
  status?: InterventionStatus;
  tags?: Tag[];
}

export interface Tag {
  label: string;
  icon: string;
}

export interface InterventionStatus {
  label: string;
  status: number;
}

