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
import { BehaviorSubject, Observable, from } from 'rxjs';
import { TreeDataService } from './dataservices/tree.dataservice';
import { TreeData, TreeFilter } from '../models/filter/filter-component-models/TreeFilter.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  constructor(private mapService: MapService,
    private treeService: TreeDataService) {
    from(this.treeService.getDefaultTree()).subscribe((treeDefintion: TreeData[]) => {
      const segDetail= <FilterSegment>{
        id: 24,
        name: 'Details',
        position: 5,
        selected: false,
        components: [new TreeFilter(1, true, 1,treeDefintion)]
      };
      this.filter.segments.push(segDetail);
      this.setfilterForm(this.filter);
    });
  }

  private filter: Filter = patrimonyFilterMock;
  private filterForm$ = new BehaviorSubject<Filter>(this.filter);
  private currentFavorite: FavData | undefined;

  public setFilterForm(filter: Filter) {
    this.filterForm$.next(filter);
  }

  public onFilterForm(): Observable<Filter> {
    return this.filterForm$.asObservable();
  }

  /**
   * Returns the current filter object used for favorites.
   */
  public getFilter(): Filter {
    return this.filter;
  }

  /**
   *
   * @param filter - filter to update
   */
  public setFilter(filter: Filter): void {
    this.filter = filter;
    this.setFilterForm(this.filter);
  }

  /**
   * Sets the current favorite and applies it on the map.
   * @param fav - The favorite to be set as current.
   */
  public setCurrentFavorite(fav: FavData): void {
    if (this.currentFavorite) {
      this.removeCurrentFavorite();
    }
    this.applyFavorite(fav);
  }

  /**
   * Applies a favorite on the map.
   * @param fav - The favorite to be applied.
   */
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

  /**
   * Removes the current favorite from the map.
   */
  public removeCurrentFavorite(): void {
    if (this.currentFavorite) {
      this.currentFavorite.value = false;
      this.removeFavorite(this.currentFavorite);
    }
  }

  /**
   * Removes a favorite from the map.
   * @param fav - The favorite to be removed.
   */
  public removeFavorite(fav: FavData): void {
    fav?.equipments?.forEach((eq: EqData) => {
      this.mapService.removeEventLayer(eq.key);
    });
    this.currentFavorite = undefined;
  }

  /**
   * Returns the currently selected favorite.
   * @returns The currently selected favorite or undefined.
   */
  public getSelectedFavorite(): FavData | undefined {
    return this.currentFavorite;
  }

  /**
   * Modifies the currently selected favorite.
   * @param fav - The modified favorite to be set as current.
   */
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

  /**
   * Returns a list of favorites for a specific segment.
   * @param segment - The segment ID.
   * @returns A list of favorites for the given segment.
   */
  public getFavList(segment: number): FavData[] {
    const favs: FavData[] = this.filter.segments
      .flatMap(
        (s) => {
          let fav: FavoriteFilter | undefined = s.components.find((c) => c instanceof FavoriteFilter);
          if (fav) {
            return fav.data.filter((f: FavData) => f.segment === segment)
          }
          return []
        }
      )
      .filter(Boolean);
    return favs;
  }

  /**
  * Adds a favorite filter to the filter segments
  * @param fav The favorite filter to add
  */
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

  /**
  * Deletes a favorite filter from the filter segments
  * @param fav The favorite filter to delete
  */
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

  /**
  * Renames a favorite filter
  * @param fav The favorite filter to rename
  * @param name The new name for the favorite filter
  */
  public renameFavorite(fav: FavData, name: string): void {
    let n = 0;
    while (this.getFavList(fav.segment!).map(f => f.name).includes(name)) {
      n += 1;
      name = `${name} - ${n}`;
    }
    fav.name = name;

    this.modifyCurrentFavorite(fav);
  }

  /**
  * Gets all favorite filters in the filter segments
  * @returns An array of favorite filters
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
