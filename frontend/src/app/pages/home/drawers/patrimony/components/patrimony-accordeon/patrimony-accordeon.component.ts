import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FavoriteSelection } from 'src/app/models/favorite.model';
import { MapService } from 'src/app/services/map.service';
import { AccordeonData, AccordeonSelection } from '../../patrimony-dataset';
import { FavoritesActionEnum } from './favorites-action.enum';

@Component({
  selector: 'app-patrimony-accordeon',
  templateUrl: './patrimony-accordeon.component.html',
  styleUrls: ['./patrimony-accordeon.component.scss'],
})
export class PatrimonyAccordeonComponent implements OnInit {

  constructor(
    private mapService: MapService
  ) {}

  @Input() accordeonData: AccordeonData;
  @Input() mode: 'md' | 'ios' | undefined = 'md';
  @Input() singleSelection: boolean = false;
  @Input() selectedSegment: string;
  @Input() saveableFavorite: boolean = false;
  @Input() type: string;

  @Output("onSingleSelection") onSingleSelection: EventEmitter<AccordeonSelection> = new EventEmitter();
  @Output("onSelection") onSelection: EventEmitter<AccordeonSelection> = new EventEmitter();

  favsAction: FavoritesActionEnum;
  icon: string = '';

  private isOpen: boolean = false;

  ngOnInit() {
    if (this.accordeonData.children && this.accordeonData.children.length > 0 || this.mode === 'ios') {
      this.icon = 'add-outline';
    }
    if (this.accordeonData.children?.filter((acc) => acc.selected).length !== 0 
        && this.accordeonData.children?.filter((acc) => acc.selected).length !== this.accordeonData.children?.length) {
      this.accordeonData.isInderminate = true;
    }
  }

  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(event: MouseEvent): void {
    if (this.accordeonData.children && this.accordeonData.children.length === 0 && this.mode === 'md') {
      event.stopPropagation();
    } else {
      this.isOpen = !this.isOpen;
      this.icon = this.isOpen ? 'remove-outline' : 'add-outline';
    }
  }

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onCheckboxChange(e: Event): void {
    this.accordeonData.selected = (e as CustomEvent).detail.checked;
    this.managerEvent(this.accordeonData, false, null,'select');
    this.accordeonData.isInderminate = this.accordeonData.selected ? false : this.accordeonData.isInderminate;
    if (!this.accordeonData.isInderminate) {
      if (this.accordeonData.selected) {
        this.accordeonData.children?.forEach((child: AccordeonData) => {
          if (!child.selected) {
            child.selected=true;
            this.managerEvent(child,true,this.accordeonData,'select');
            if (child.key.length > 0) this.mapService.addEventLayer(child.key);
          }
        });
        if (this.accordeonData.key.length > 0) this.mapService.addEventLayer(this.accordeonData.key);
      } else {
        this.accordeonData.children?.forEach((child: AccordeonData) => {
          if (child.selected) {
            child.selected=false;
            this.managerEvent(child,true,this.accordeonData,'select');
            console.log(child.key);
            if (child.key.length > 0) this.mapService.removeEventLayer(child.key);
          } else {
            if (child.key.length > 0) this.mapService.removeEventLayer(child.key);
          }
        });
        if (this.accordeonData.key.length > 0) this.mapService.removeEventLayer(this.accordeonData.key);
      }
    }
  }

  managerEvent(item:AccordeonData, isChild:boolean, parent:AccordeonData|null, action: string){
    let selectedAccordeonData: AccordeonSelection = {
      data: item,
      type: this.type,
      segment: this. selectedSegment,
      action: action,
      isChild: isChild,
      parent: parent
    }
    if(this.singleSelection && item.selected){
      this.onSingleSelection.emit(selectedAccordeonData);
    }
    if(this.saveableFavorite){
      this.onSelection.emit(selectedAccordeonData);
    }
    if(this.type === "favorite"){
      this.onSelection.emit(selectedAccordeonData);
    }
  }

  /**
   * If the child is already in the Set, delete it, otherwise add it
   * @param {AccordeonData} child - Accordeon
   */
  onChildSelected(child: AccordeonData): void {
    if (child.selected) {
      this.mapService.removeEventLayer(child.key);
      child.selected = false;
    } else {
      this.mapService.addEventLayer(child.key);
      child.selected = true;
    }
    this.managerEvent(child,true,this.accordeonData,'select');
    this.accordeonData.selected = this.accordeonData?.children?.filter(e => e.selected).length === this.accordeonData?.children?.length;
    this.accordeonData.isInderminate = !this.accordeonData.selected && this.accordeonData?.children?.filter(e => e.selected).length != 0;
  }

  

/**
 * Sets the value of the `favsAction` property to the value of
 * the `FavoritesActionEnum` enum that matches the string
 * @param {string} action - string - the action to be performed on the favorites
 */
  setDetailAction(action: string): void {
    if(action === 'DELETE') {
      this.managerEvent(this.accordeonData, false, null,'delete');
    }
  }
}
