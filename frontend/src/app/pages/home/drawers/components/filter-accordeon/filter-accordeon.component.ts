import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AccordeonData } from 'src/app/core/models/filter/filter-component-models/AccordeonFilter.model';
import { EqData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { MapService } from 'src/app/core/services/map.service';

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

  @Input() data: AccordeonData;

  icon: string = '';
  isOpen: boolean = false;
  isChildAction: boolean = false;


  ngOnInit() {
    if (this.data.children && this.data.children.length > 0) {
      this.icon = 'add-outline';
    }
    if (this.data.children?.filter((acc) => acc.value).length !== 0 
        && this.data.children?.filter((acc) => acc.value).length !== this.data.children?.length) {
      this.data.isIndeterminate = true;
    }

    setTimeout(() => {
      this.checkFavValue(this.data);
    });
  }

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onCheckboxChange(e: Event): void {
    this.data.value = (e as CustomEvent).detail.checked;
    this.data.isIndeterminate = this.data.value ? false : this.data.isIndeterminate;

    if (!this.data.isIndeterminate) {
      if (this.data.value) {
        this.data.children?.forEach((child: AccordeonData) => {
          if (!child.value) {
            child.value=true;
            if (child.key && child.key.length > 0) this.mapService.addEventLayer(child.key);
          }
        });
        if (this.data.key && this.data.key.length > 0) this.mapService.addEventLayer(this.data.key);
      } else {
        this.data.children?.forEach((child: AccordeonData) => {
          if (child.value) {
            child.value=false;
            if (child.key && child.key.length > 0) this.mapService.removeEventLayer(child.key);
          } else {
            if (child.key && child.key.length > 0) this.mapService.removeEventLayer(child.key);
          }
        });
        if (this.data.key && this.data.key.length > 0) this.mapService.removeEventLayer(this.data.key);
      }
    }
  }

  /**
   * If the child is already in the Set, delete it, otherwise add it
   * @param {AccordeonData} child - Accordeon
   */
  onChildSelected(child: AccordeonData): void {
    if (child.value) {
      if(child.key) this.mapService.removeEventLayer(child.key);
      child.value = false;
    } else {
      if(child.key) this.mapService.addEventLayer(child.key);
      child.value = true;
    }
    //this.managerEvent(child,true,this.accordeonData,'select');
    this.data.value = this.data?.children?.filter(e => e.value).length === this.data?.children?.length ? true : false;
    if(!this.data.value || this.data.value) {
      this.data.isIndeterminate = this.data?.children?.filter(e => e.value).length != 0 ? true : false;
    }
  }

  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(event: MouseEvent): void {
    if (!this.data.children || this.data.children.length === 0) {
      event.stopPropagation();
    } else {
      this.isOpen = !this.isOpen;
      this.icon = this.isOpen ? 'remove-outline' : 'add-outline';
    }
  }

  private checkFavValue(data: AccordeonData): void {
    data.value = this.favService.getSelectedFavorite()?.equipments?.some((eq: EqData) => eq.id === data.id && eq.key === data.key);
    if (data.children) {
      data.children.forEach((d: AccordeonData) => {
        this.checkFavValue(d);
      })
    }
    data.isIndeterminate = data.children?.some((child) => child.value);
  }

}
