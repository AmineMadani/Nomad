import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonModal, InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-search-multi-select',
  templateUrl: './search-multi-select.component.html',
  styleUrls: ['./search-multi-select.component.scss'],
})
export class SearchMultiSelectComponent implements OnInit {

  constructor() { }

  @Input() key: string;
  @Input() label: string;
  @Input() title: string;
  @Input() control: any;

  @Input() originalList: any[] = [];
  public displayedList: any[] = [];
  public querySearch: string = "";

  @ViewChild('modal') modal: IonModal;

  ngOnInit() {
  }

  /**
   * Get the label to display
   * @returns the label
   */
  getValueLabel(): string {
    return this.control.value.map((id) => {
      const element = this.originalList.find((el) => el.id === id);
      return element ? element[this.key] : null;
    }).join(', ');
  }

  /**
   * Return the list of options filter on the paramMap data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  getFilterOptions(query): any[] {
    return this.originalList.filter((element) => element[this.key].includes(query));
  }

  /**
   * Method to load the next options from the infinity scroll
   * @param e the ion infinity event
   */
  onIonInfinite(e) {
    this.displayedList = [...this.displayedList, ...this.getFilterOptions(this.querySearch).slice(this.displayedList.length, this.displayedList.length + 50)];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  /**
   * Method to filter on the search input
   * @param e the ion input event
   */
  onHandleInput(event) {
    this.querySearch = event.target.value.toLowerCase();
    this.displayedList = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  /**
   * Action on the selected data
   * @param event the ion radio event
   */
  onCheckboxChange(event, element: any) {
    if (event.detail.checked) {
      this.control.setValue([...this.control.value, element.id]);
    } else {
      const indexToRemove = this.control.value.indexOf(element.id);
      if (indexToRemove > -1) {
        const newList = [...this.control.value];
        newList.splice(indexToRemove, 1);

        this.control.setValue([...newList]);
      }
    }
  }

  isElementSelected(element: any) {
    return this.control.value.some((id) => id === element.id);
  }

  /**
   * Method to open the modal and filter the options before
   */
  onOpenModal() {
    this.displayedList = this.getFilterOptions(this.querySearch).slice(0, 50);
    this.modal.present();
  }

}
