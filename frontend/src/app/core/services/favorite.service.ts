import { Injectable } from '@angular/core';
import { patrimonyFilterMock } from '../mocks/filter-patrimony.mock';
import {
  EqData,
  FavData,
  FavoriteFilter,
} from '../models/filter/filter-component-models/FavoriteFilter.model';
import {
  FilterSegment,
  FilterType,
} from '../models/filter/filter-segment.model';
import { Filter } from '../models/filter/filter.model';
import { MapService } from './map/map.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  constructor(private mapService: MapService) {}

  private filter: Filter = patrimonyFilterMock;

  private currentFavorite: FavData | undefined;

  public getFilter(): Filter {
    return this.filter;
  }

  public setCurrentFavorite(fav: FavData): void {
    if (this.currentFavorite) {
      this.removeCurrentFavorite();
    }
    this.applyFavorite(fav);
  }

  public applyFavorite(fav: FavData): void {
    if (this.mapService.getCurrentLayersKey().length > 0) {
      this.mapService.resetLayers();
    }

    fav.equipments?.forEach((eq: EqData) => {
      this.mapService.addEventLayer(eq.key);
    });
    this.currentFavorite = fav;
    this.currentFavorite.value = true;
  }

  public removeCurrentFavorite(): void {
    if (this.currentFavorite) {
      this.currentFavorite.value = false;
      this.removeFavorite(this.currentFavorite);
    }
  }

  public removeFavorite(fav: FavData): void {
    fav?.equipments?.forEach((eq: EqData) => {
      this.mapService.removeEventLayer(eq.key);
    });
    this.currentFavorite = undefined;
  }

  public getSelectedFavorite(): FavData | undefined {
    return this.currentFavorite;
  }

  public modifyCurrentFavorite(fav: FavData): void {
    this.currentFavorite = fav;
    this.filter.segments.forEach((fs: FilterSegment) => {
      if (fs.id === fav.segment) {
        fs.components.forEach((ft: FilterType) => {
          if (ft.getType() === 'favFilter') {
            const favIndex = ft.data.findIndex(
              (eq: FavData) => (eq.id = fav.id)
            );
            ft.data[favIndex] = fav;
          }
        });
      }
    });
  }

  public getFavList(segment: number): FavData[] {
    const favs: FavData[] = this.filter.segments
      .flatMap(
        (s) => {
          let fav: FavoriteFilter | undefined = s.components.find((c) => c instanceof FavoriteFilter);
          if(fav) {
            return fav.data.filter((f: FavData) => f.segment === segment)
          }
          return []
        }
      )
      .filter(Boolean);
    return favs;
  }

  public addFavorite(fav: FavData): void {
    const favs = this.getFavList(fav.segment!);

    if (favs.length > 0) {
      const { maxId, maxPosition } = favs.reduce(
        (acc, cur) => {
          const { id, position } = cur;
          return {
            maxId: Math.max(acc.maxId, id!),
            maxPosition: Math.max(acc.maxPosition, position),
          };
        },
        { maxId: -Infinity, maxPosition: -Infinity }
      );

      fav.id = maxId;
      fav.position = maxPosition;
    } else {
      fav.id = 1;
      fav.position = 1;
    }

    this.filter.segments.forEach((fs: FilterSegment) => {
      fs.components.forEach((ft: FilterType) => {
        if (ft.getType() === 'favoriteFilter') {
          ft.data.push(fav);
        }
      });
    });
  }

  public deleteFavorite(fav: FavData): void {
    this.filter.segments.some((s) => {
      return s.components.some((c) => {
        if (c.getType() === 'favoriteFilter') {
          const index = c.data.findIndex((f: FavData) => f === fav);
          if (index !== -1) {
            c.data.splice(index, 1);
            return true;
          }
        }
        return false;
      });
    });
  }

  public renameFavorite(fav: FavData, name: string): void {
    let n = 0;
    while(this.getFavList(fav.segment!).map(f => f.name).includes(name)) {
      n += 1;
      name = `${name} - ${n}`;
    }
    fav.name = name;

    this.modifyCurrentFavorite(fav);
  }

/**
*  Returns the complete list of favorites
*/
  public getAllFavList(): FavData[] {
    const favs: FavData[] = this.filter.segments.flatMap((s) => {
      const favoriteFilter = s.components.find((c) => c instanceof FavoriteFilter);
      if (favoriteFilter) {
        return (favoriteFilter?.data as FavData[]).filter(Boolean);
      }
      return [];
    });
    return favs;
  }

}
