import { MapService } from 'src/app/core/services/map.service';
import { BaseFilterData, BaseFilter } from './BaseFilter.model';
import { FavoriteItem } from './FavoriteFilter.model';

export class InterventionFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: InterventionData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: InterventionData[]
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.data = data;
  }
  applyFavorite(mapService: MapService, favoriteItem: FavoriteItem): void {
    throw new Error('Method not implemented.');
  }
  getFavorites(): FavoriteItem[] {
    throw new Error('Method not implemented.');
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
  tags?: Tag[];
}

export interface Tag {
  label: string;
  filled: boolean;
  icon: string;
}
