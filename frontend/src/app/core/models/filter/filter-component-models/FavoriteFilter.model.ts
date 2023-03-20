import { BaseFilterData, BaseFilter } from './BaseFilter.model';

export class FavoriteFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: FavData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: FavData[]
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.data = data;
  }

  getType(): string {
    return 'favoriteFilter';
  }

  reset(): void {
    this.data.forEach((fd: FavData) => fd.value = false);
  }

  isSelectedData(): boolean {
    return this.data.some((fd: FavData) => fd.value);
  }
}

export interface FavData extends BaseFilterData {
  segment?: number;
  equipments?: EqData[]
}

export interface EqData {
  id: number;
  key: string;
}
