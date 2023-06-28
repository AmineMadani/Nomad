import { Component, Input, OnInit } from '@angular/core';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss'],
})
export class AssetDetailComponent implements OnInit {

  constructor(
    public assetFilterService: AssetFilterService
  ) { 
  }

  @Input() filterTree: FilterAsset[];

  ngOnInit() {
  }

  hasChild = (_: number, node: FilterAsset): boolean =>
    !!node.child && node.child.length > 0;

  onCheckboxChange(e: Event, node: FilterAsset): void {
    this.assetFilterService.selectAssetFilter(node,(e as CustomEvent).detail.checked)
  }
}
