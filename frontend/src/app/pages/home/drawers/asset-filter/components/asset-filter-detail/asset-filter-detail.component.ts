import { Component, Input, OnInit } from '@angular/core';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';

@Component({
  selector: 'app-asset-filter-detail',
  templateUrl: './asset-filter-detail.component.html',
  styleUrls: ['./asset-filter-detail.component.scss'],
})
export class AssetFilterDetailComponent implements OnInit {

  constructor(
    public assetFilterService: AssetFilterService
  ) {
  }

  @Input() filterTree: FilterAsset[];

  ngOnInit() {
  }

  hasChild = (_: number, node: FilterAsset): boolean =>
    !!node.child && node.child.length > 0;

  setChange(node: FilterAsset, e: Event): void {
    node.selected = !node.selected;
    this.assetFilterService.selectAssetFilter(node, node.selected);

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
}
