import { InterventionStatusEnum } from '../../map-feature.model';
import { BaseFilterData, BaseFilter } from './BaseFilter.model';

export class InterventionFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public type: 'intervention' | 'demand';
  public data: InterventionData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    type: 'intervention' | 'demand', 
    data: InterventionData[]
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
    return 'interventionFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data = null as any;
    }
  }
}

export interface InterventionData extends BaseFilterData {
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
  status: InterventionStatusEnum;
}

