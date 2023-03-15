import { MapService } from 'src/app/core/services/map.service';
import { BaseFilter, BaseFilterData } from './BaseFilter.model';
import { FavoriteItem } from './FavoriteFilter.model';

export class ToggleFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: ToggleData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: ToggleData[]
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
    return 'toggleFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data.value = false;
    }
  }
}

export interface ToggleData extends BaseFilterData {}
