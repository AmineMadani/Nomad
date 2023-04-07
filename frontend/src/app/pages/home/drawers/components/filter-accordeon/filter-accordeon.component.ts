import { Component, Input, OnInit } from '@angular/core';
import { AccordeonData } from 'src/app/core/models/filter/filter-component-models/AccordeonFilter.model';
import { EqData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-filter-accordeon',
  templateUrl: './filter-accordeon.component.html',
  styleUrls: ['./filter-accordeon.component.scss'],
})
export class FilterAccordeonComponent implements OnInit {

  constructor(
    private mapService: MapService,
    private favService: FavoriteService,
  ) { }

  @Input() datas: AccordeonData[];

  accordionToOpen: string[] = [];

  ngOnInit() {
    this.datas.forEach(data => {
      if(data.children && data.children.length > 0) {
        this.accordionToOpen.push(data.id.toString());
        data.isOpen = true;
      }
      if (data.children?.filter((acc) => acc.value).length !== 0 
          && data.children?.filter((acc) => acc.value).length !== data.children?.length) {
        data.isIndeterminate = true;
      }
  
      setTimeout(() => {
        this.checkFavValue(data);
      });
    });
  }

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onCheckboxChange(data: AccordeonData, e: Event): void {
    data.value = (e as CustomEvent).detail.checked;
    data.isIndeterminate = data.value ? false : data.isIndeterminate;

    if (!data.isIndeterminate) {
      if (data.value) {
        data.children?.forEach((child: AccordeonData) => {
          if (!child.value) {
            child.value=true;
            if (child.key && child.key.length > 0) this.mapService.addEventLayer(child.key);
          }
        });
        if (data.key && data.key.length > 0) this.mapService.addEventLayer(data.key);
      } else {
        data.children?.forEach((child: AccordeonData) => {
          if (child.value) {
            child.value=false;
            if (child.key && child.key.length > 0) this.mapService.removeEventLayer(child.key);
          } else {
            if (child.key && child.key.length > 0) this.mapService.removeEventLayer(child.key);
          }
        });
        if (data.key && data.key.length > 0) this.mapService.removeEventLayer(data.key);
      }
    }
  }

  /**
   * If the child is already in the Set, delete it, otherwise add it
   * @param {AccordeonData} child - Accordeon
   */
  onChildSelected(data: AccordeonData, child: AccordeonData): void {
    if (child.value) {
      if(child.key) this.mapService.removeEventLayer(child.key);
      child.value = false;
    } else {
      if(child.key) this.mapService.addEventLayer(child.key);
      child.value = true;
    }
    //this.managerEvent(child,true,this.accordeonData,'select');
    data.value = data?.children?.filter(e => e.value).length === data?.children?.length ? true : false;
    if(!data.value || data.value) {
      data.isIndeterminate = data?.children?.filter(e => e.value).length != 0 ? true : false;
    }
  }

  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(data: AccordeonData, event: MouseEvent): void {
    if (!data.children || data.children.length === 0) {
      event.stopPropagation();
    } else {
      data.isOpen = !data.isOpen;
    }
  }

  private checkFavValue(data: AccordeonData): void {
    if (this.favService.getSelectedFavorite()) {
      data.value = this.favService.getSelectedFavorite()?.equipments?.some((eq: EqData) => eq.id === data.id && eq.key === data.key);
      if (data.children) {
        data.children.forEach((d: AccordeonData) => {
          this.checkFavValue(d);
        })
      }
      data.isIndeterminate = data.children?.some((child) => child.value);
    }
  }

}
