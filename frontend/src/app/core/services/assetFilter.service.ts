import { Injectable } from '@angular/core';
import { FilterAsset } from '../models/filter/filter.model';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MapService } from './map/map.service';
import { Favorite } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

/**
 * Service of Asset
 */
export class AssetFilterService {

  constructor(
    private mapService: MapService
  ) { }

  public assetFilter: FilterAsset[];
  public dataSource: MatTreeNestedDataSource<FilterAsset>;
  public treeControl: NestedTreeControl<FilterAsset>;
  public selectedFavorite: Favorite;

  public getAssetFilter(): FilterAsset[] {
    return this.assetFilter;
  }

  public getAssetFilterDataSource(): MatTreeNestedDataSource<FilterAsset> {
    return this.dataSource;
  }

  public getAssetFilterTreeControl(): NestedTreeControl<FilterAsset> {
    return this.treeControl;
  }

  public setAssetFilter(assetFilter: FilterAsset[]) {
    this.assetFilter = assetFilter;
    this.dataSource = new MatTreeNestedDataSource<FilterAsset>();
    this.treeControl = new NestedTreeControl<FilterAsset>(
      (node: FilterAsset) => node.child
    );
    this.dataSource.data = this.assetFilter;
  }

  public selectAssetFilter(node: FilterAsset, value: boolean) {
    node.selected = value;
    this.displayNode(node);
    const descendants = this.treeControl.getDescendants(node);
    for (let descendant of descendants) {
      descendant.selected = value;
      this.displayNode(descendant);
    }
    this.refreshAssetFilter(this.assetFilter);
  }

  public getFilterSegment(treeFilter: FilterAsset[]): FilterAsset[] {
    let filters: FilterAsset[] = [];
    for (let filter of treeFilter) {
      if (filter.segment) {
        filters.push(filter);
      } else if (filter.child?.length > 0) {
        filters.concat(this.getFilterSegment(filter.child));
      }
    }
    return filters;
  }

  public getselectedLayer(selectedSegment: FilterAsset | undefined): FilterAsset[] {
    let descendants: FilterAsset[] = [];

    if(selectedSegment) {
      descendants = this.treeControl.getDescendants(selectedSegment);
    } else {
      for(let assetFilter of this.assetFilter) {
        descendants = descendants.concat(this.treeControl.getDescendants(assetFilter))
      }
    }

    return descendants.filter(descendant => descendant.selected && descendant.layerKey)
  }

  private displayNode(node: FilterAsset) {
    if (node.layerKey) {
      if (node.selected) {
        this.mapService.addEventLayer(node.layerKey, node.styleKey);
      } else {
        this.mapService.removeEventLayer(node.layerKey, node.styleKey);
      }
    }
  }

  public applyFavorite(favorite: Favorite) {
    this.reset();
    let descendants: FilterAsset[] = [];
    for(let assetFilter of this.assetFilter) {
      descendants = descendants.concat(this.treeControl.getDescendants(assetFilter))
    }

    for(let layer of favorite.layers) {
      for(let descendant of descendants){
        if(layer.styleKey) {
          if(layer.styleKey == descendant.styleKey && layer.layerKey == descendant.layerKey) {
            this.selectAssetFilter(descendant, true);
          } 
        } else {
          if(!descendant.styleKey && layer.layerKey == descendant.layerKey) {
            this.selectAssetFilter(descendant, true);
          }
        }
      }
    }

    setTimeout(() => {
      this.refreshAssetFilter(this.assetFilter);
      this.selectedFavorite = favorite;
    });
  }

  public reset() {
    for (let filter of this.assetFilter) {
      this.selectAssetFilter(filter, false);
    }
    this.selectedFavorite = undefined;
  }

  public hasSelectedItem(): boolean {
    for (let filter of this.assetFilter) {
      if (filter.selected) {
        return true;
      }
      const descendants = this.treeControl.getDescendants(filter);
      for (let descendant of descendants) {
        if (descendant.selected) {
          return true;
        }
      }
    }
    return false;
  }

  public hasSelectedItemOnSegment(filterAsset: FilterAsset): boolean {
    if (filterAsset.selected) {
      return true;
    }
    const descendants = this.treeControl.getDescendants(filterAsset);
    for (let descendant of descendants) {
      if (descendant.selected) {
        return true;
      }
    }
    return false;
  }

  private refreshAssetFilter(filters: FilterAsset[]) {
    for (let filter of filters) {
      let descendants = this.treeControl.getDescendants(filter);
      let count = 0;
      for (let descendant of descendants) {
        if (descendant.selected) {
          count++;
        }
      }
      if (count == descendants.length && descendants.length > 0) {
        filter.selected = true;
        filter.isIndeterminate = false;
      } else if (count > 0) {
        filter.selected = false;
        filter.isIndeterminate = true;
      } else {
        if (descendants.length > 0) {
          filter.selected = false;
          filter.isIndeterminate = false;
        }
      }
      if (filter.child && filter.child.length > 0) {
        setTimeout(() => {
          this.refreshAssetFilter(filter.child);
        });
      }
    }
  }

}