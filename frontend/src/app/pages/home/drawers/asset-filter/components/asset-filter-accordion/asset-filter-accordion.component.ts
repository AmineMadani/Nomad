import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonAccordionGroup } from '@ionic/angular';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';

@Component({
  selector: 'app-asset-filter-accordion',
  templateUrl: './asset-filter-accordion.component.html',
  styleUrls: ['./asset-filter-accordion.component.scss'],
})
export class AssetFilterAccordionComponent implements OnInit {

  constructor(
    private assetFilterService: AssetFilterService
  ) { }

  @Input() filterSegment: FilterAsset;

  @ViewChild('accordionGroup', { static: true }) accordionGroup: IonAccordionGroup;

  ngOnInit() {
    this.initAccordionState();
  }

  private initAccordionState() {
    this.filterSegment.child.forEach(item => {
      if (!item.hideChild && item.child && item.child.length > 0 && !item.closedAccordion) {
        setTimeout(() => {
          const nativeEl = this.accordionGroup;
          nativeEl.value = item.name;
        });
      }
    })
  }

  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  public onCheckOpeningRule(data: FilterAsset, event: MouseEvent): void {
    if (data.hideChild || !data.child || data.child.length === 0) {
      this.onItemSelected(data, event);
      event.stopPropagation();
    } else {
      data.closedAccordion = !data.closedAccordion;
    }
  }

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onItemSelected(item: FilterAsset, e: Event, isCustomEvent?: boolean): void {
    if (isCustomEvent) {
      this.assetFilterService.selectAssetFilter(item,(e as CustomEvent).detail.checked);
    } else {
      this.assetFilterService.selectAssetFilter(item,!item.selected);
    }
  }

}
