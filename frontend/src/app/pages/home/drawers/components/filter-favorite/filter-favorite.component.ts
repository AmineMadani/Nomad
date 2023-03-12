import { Component, Input, OnInit } from '@angular/core';
import { FavoriteData } from 'src/app/models/filter-models/filter-component-models/FavoriteFilter.model';
import { Filter } from 'src/app/models/filter-models/filter.model';

@Component({
  selector: 'app-filter-favorite',
  templateUrl: './filter-favorite.component.html',
  styleUrls: ['./filter-favorite.component.scss'],
})
export class FilterFavoriteComponent implements OnInit {

  constructor() { }

  @Input() data: FavoriteData;
  @Input() filter: Filter;

  icon: string = '';
  isOpen: boolean = false;

  ngOnInit() {
    this.icon = 'add-outline';
  }

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onCheckboxChange(e: Event): void {
    this.data.value = (e as CustomEvent).detail.checked;
  }

  
  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(event: MouseEvent): void {
    console.log('toto');
    this.isOpen = !this.isOpen;
    this.icon = this.isOpen ? 'remove-outline' : 'add-outline';
  }

  /**
 * Sets the value of the `favsAction` property to the value of
 * the `FavoritesActionEnum` enum that matches the string
 * @param {string} action - string - the action to be performed on the favorites
 */
  setDetailAction(action: string): void {
    console.log(action);
    console.log(this.filter);
  }

}
