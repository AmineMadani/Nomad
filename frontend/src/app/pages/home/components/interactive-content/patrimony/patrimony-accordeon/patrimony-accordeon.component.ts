import { Component, Input, OnInit } from '@angular/core';
import { Accordeon } from '../patrimony-dataset';
import { FavoritesActionEnum } from './favorites-action.enum';

@Component({
  selector: 'app-patrimony-accordeon',
  templateUrl: './patrimony-accordeon.component.html',
  styleUrls: ['./patrimony-accordeon.component.scss'],
})
export class PatrimonyAccordeonComponent implements OnInit {
  constructor() {
    this.selectedChildren = new Set<Accordeon>();
  }

  @Input() accordeon: Accordeon;
  @Input() mode: 'md' | 'ios' = 'md';
  isChecked: boolean = false;
  isIndeterminate: boolean = false;
  selectedChildren: Set<Accordeon>;
  favsAction: FavoritesActionEnum;
  icon: string = '';
  
  private isOpen: boolean = false;

  ngOnInit() {
    if (this.accordeon.children && this.accordeon.children.length > 0 || this.mode === 'ios') {
      this.icon = 'add-outline';
    }
  }

  /**
   * If the accordeon has no children or is in md mode, then stop the event 
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(event: MouseEvent): void {
    if (this.accordeon.children && this.accordeon.children.length === 0 && this.mode === 'md') {
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
    this.isChecked = (e as CustomEvent).detail.checked;
    this.isIndeterminate = this.isChecked ? false : this.isIndeterminate;
    if (!this.isIndeterminate) {
      if (this.isChecked && this.accordeon.children) {
        this.accordeon.children.forEach((child: Accordeon) => {
          if (!this.selectedChildren.has(child)) {
            this.selectedChildren.add(child);
          }
        });
      } else if (!this.isChecked) {
        this.selectedChildren.clear();
      }
      // Next : output this.selectedChildren to load in parent the data relative to the current Set
    }
  }

  /**
   * If the child is already in the Set, delete it, otherwise add it
   * @param {Accordeon} child - Accordeon
   */
  onChildSelected(child: Accordeon): void {
    this.selectedChildren.has(child)
      ? this.selectedChildren.delete(child)
      : this.selectedChildren.add(child);
    this.isChecked = this.selectedChildren.size === this.accordeon?.children?.length;
    this.isIndeterminate = !this.isChecked && this.selectedChildren.size > 0;
    // Next : output this.selectedChildren to load in parent the data relative to the current Set
  }

/**
 * Sets the value of the `favsAction` property to the value of
 * the `FavoritesActionEnum` enum that matches the string
 * @param {string} action - string - the action to be performed on the favorites
 */
  setDetailAction(action: string): void {
    this.favsAction = FavoritesActionEnum[action as keyof typeof FavoritesActionEnum];
  }
}
