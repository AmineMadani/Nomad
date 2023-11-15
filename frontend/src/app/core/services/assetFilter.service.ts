import { Injectable } from '@angular/core';
import { FilterAsset } from '../models/filter/filter.model';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MapService } from './map/map.service';
import { Favorite } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})

/**
 * Service of Asset
 */
export class AssetFilterService {
  constructor(
    private mapService: MapService,
    private userService: UserService
  ) {}

  public assetFilter: FilterAsset[];
  public dataSource: MatTreeNestedDataSource<FilterAsset>;
  public treeControl: NestedTreeControl<FilterAsset>;
  public selectedFavorite: Favorite;

  /**
   * Return the asset filter
   * @returns asset filter
   */
  public getAssetFilter(): FilterAsset[] {
    return this.assetFilter;
  }

  /**
   * Retur the asset filter datasource
   * @returns asset filter datasource
   */
  public getAssetFilterDataSource(): MatTreeNestedDataSource<FilterAsset> {
    return this.dataSource;
  }

  /**
   * Get the asset filter tree control
   * @returns asset filter tree control
   */
  public getAssetFilterTreeControl(): NestedTreeControl<FilterAsset> {
    return this.treeControl;
  }

  /**
   * Set the asset filter
   * @param assetFilter the asset filter
   */
  public setAssetFilter(assetFilter: FilterAsset[]) {
    this.assetFilter = assetFilter;
    this.dataSource = new MatTreeNestedDataSource<FilterAsset>();
    this.treeControl = new NestedTreeControl<FilterAsset>(
      (node: FilterAsset) => node.child
    );
    this.dataSource.data = this.assetFilter;
    this.mapService.onMapLoaded().subscribe(() => {
      const mapLayerLoaded: string[] = Object.keys(
        this.mapService.getMap().style._layers
      ).map((key) => key);
      if (mapLayerLoaded && mapLayerLoaded.length > 0) {
        let descendants: FilterAsset[] = [];
        for (let assetFilter of this.assetFilter) {
          descendants = descendants.concat(
            this.treeControl.getDescendants(assetFilter)
          );
        }
        for (let descendant of descendants) {
          if (descendant.styleKey) {
            if (mapLayerLoaded.includes(descendant.styleKey?.toUpperCase())) {
              this.selectAssetFilter(descendant, true);
            }
          } else {
            if (mapLayerLoaded.includes(descendant.layerKey?.toUpperCase())) {
              this.selectAssetFilter(descendant, true);
            }
          }
        }
        setTimeout(() => {
          this.refreshAssetFilter(this.assetFilter);
        });
      }
    });
  }

  /**
   * Select the asset filter
   * @param node the filter asset to select
   * @param value true or false
   */
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

  /**
   * Get filter asset with the segment type
   * @param treeFilter the tree filter
   * @returns segments filters asset
   */
  public getFilterSegment(treeFilter: FilterAsset[]): FilterAsset[] {
    let filters: FilterAsset[] = [];
    for (let filter of treeFilter) {
      if (filter.segment) {
        filters.push(filter);
      } else if (filter.child?.length > 0) {
        filters.concat(this.getFilterSegment(filter.child));
      }
    }
    for (let filter of filters) {
      if (filter.customFilter) {
        for (let custom of filter.customFilter) {
          custom.checked = true;
        }
      }
    }
    return filters;
  }

  /**
   * Get the list of selected asset with a layer
   * @param selectedSegment the selected segment target. If undefined search in all tree
   * @returns the selected layers
   */
  public getselectedLayer(
    selectedSegment: FilterAsset | undefined
  ): FilterAsset[] {
    let descendants: FilterAsset[] = [];

    if (selectedSegment) {
      descendants = this.treeControl.getDescendants(selectedSegment);
    } else {
      for (let assetFilter of this.assetFilter) {
        descendants = descendants.concat(
          this.treeControl.getDescendants(assetFilter)
        );
      }
    }

    return descendants.filter(
      (descendant) => descendant.selected && descendant.layerKey
    );
  }

  public getSegmentLayers(selectedSegment: FilterAsset | undefined): string[] {
    let descendants: FilterAsset[] = [];

    if (selectedSegment) {
      descendants = this.treeControl.getDescendants(selectedSegment);
    } else {
      for (let assetFilter of this.assetFilter) {
        descendants = descendants.concat(
          this.treeControl.getDescendants(assetFilter)
        );
      }
    }
    
    return descendants
      .filter((descendant) => descendant.layerKey)
      .map((layer) => layer.layerKey);
  }

  /**
   * Method to display the filter asset on the map
   * @param node the filter asset to displau
   */
  private displayNode(node: FilterAsset) {
    if (node.layerKey) {
      if (node.selected) {
        this.mapService.addEventLayer(node.layerKey, node.styleKey).then(() => {
          this.userService.saveUserContext();
        });
      } else {
        this.mapService.removeEventLayer(node.layerKey, node.styleKey);
        this.userService.saveUserContext();
      }
    }
  }

  /**
   * Method to apply de favorite
   * @param favorite favorite to apply
   */
  public applyFavorite(favorite: Favorite) {
    this.reset();
    let descendants: FilterAsset[] = [];
    for (let assetFilter of this.assetFilter) {
      descendants = descendants.concat(
        this.treeControl.getDescendants(assetFilter)
      );
    }

    for (let layer of favorite.layers) {
      for (let descendant of descendants) {
        if (layer.styleKey) {
          if (
            layer.styleKey == descendant.styleKey &&
            layer.layerKey == descendant.layerKey
          ) {
            this.selectAssetFilter(descendant, true);
          }
        } else {
          if (!descendant.styleKey && layer.layerKey == descendant.layerKey) {
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

  /**
   * Reset all the tree filter
   */
  public reset() {
    for (let filter of this.assetFilter) {
      this.selectAssetFilter(filter, false);
    }
    this.selectedFavorite = undefined;
  }

  /**
   * Method to know if there is a selected filter asset in the tree
   * @returns true or false
   */
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

  /**
   * Method to know if there is a selected filter asset in a specific segment
   * @returns true or false
   */
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

  /**
   * Method to refresh all the filter asset tree
   * @param filters the filter asset tree
   */
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
