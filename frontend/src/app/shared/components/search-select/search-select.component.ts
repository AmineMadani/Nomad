import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal, InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
})
export class SearchSelectComponent implements OnInit {

  constructor() { }

  // Permit to know the component will use multiselection or monoselection (default false)
  @Input() isMultiSelection: boolean = false;
  // The attribute of the object contains in the original list which will be used for value and label in the form
  @Input() key: string;
  // Input label
  @Input() label: string;
  //
  @Input() title: string;
  // The form control to use in the input. Permit to manage errors and get updated values.
  @Input() control: any;
  // List of object used for all possible elements to select
  @Input() elements: any[] = [];
  // Function which permit to print the element with the properties we wanted. Take one param which corresponds to an element of the original list.
  @Input() elementLabelFunction: Function;

  public displayedElements: any[] = [];
  public querySearch: string = "";

  @ViewChild('modal') modal: IonModal;

  ngOnInit() {
  }

  /**
   * Get the label to display
   * @returns the label
   */
  get displayValue(): string {
    let label: string = '';
    if (this.elements && this.control.value) {
      if (this.isMultiSelection) {
        label = this.control.value.map((value: any) => {
          const element = this.elements.find((el) => el[this.key] === value);
          return element ? this.elementLabelFunction(element) : null;
        }).join(', ');
      } else {
        const element = this.elements.find((el) => el[this.key] === this.control.value);
        if (element) label = this.elementLabelFunction(element);
      }
    }

    return label;
  }

  /**
   * Return the list of options filter on the originalList data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  getFilterOptions(query): any[] {
    return this.elements.filter((element) => this.elementLabelFunction(element).toLowerCase().includes(query));
  }

  /**
   * Method to load the next options from the infinity scroll
   * @param e the ion infinity event
   */
  onIonInfinite(e) {
    this.displayedElements = [...this.displayedElements, ...this.getFilterOptions(this.querySearch).slice(this.displayedElements.length, this.displayedElements.length + 50)];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  /**
   * Method to filter on the search input
   * @param e the ion input event
   */
  onHandleInput(event) {
    this.querySearch = event.target.value.toLowerCase();
    this.displayedElements = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  /**
   * Action on the selected data
   * @param event the ion radio event
   */
  onMultiSelectionChange(event, element: any) {
    if (event.detail.checked) {
      this.control.setValue([...this.control.value, element[this.key]]);
    } else {
      const indexToRemove = this.control.value.indexOf(element[this.key]);
      if (indexToRemove > -1) {
        const newList = [...this.control.value];
        newList.splice(indexToRemove, 1);

        this.control.setValue([...newList]);
      }
    }

    this.checkSelectionErrors();
  }

  private checkSelectionErrors() {
    if (!this.control.value || (this.isMultiSelection && this.control.value.length === 0)) {
      this.control.setErrors({ required: true });
    } else {
      this.control.setErrors({ required: false });
    }
    this.control.markAsTouched();
    this.control.updateValueAndValidity();
  }


  /**
   * Permit to check if an element is selected or not.
   * @param element
   * @returns boolean: true if selected else false
   */
  isElementSelected(element: any) {
    // Multi selection
    if (this.isMultiSelection) {
      return this.control.value.some((value) => value === element[this.key]);
    }
    // Mono selection
    else {
      return this.control.value === element[this.key];
    }
  }

  /**
   * Method to open the modal and filter the options before
   */
  onOpenModal() {
    this.displayedElements = this.getFilterOptions(this.querySearch).slice(0, 50);
    this.modal.present();
  }

  onCloseModal() {
    this.checkSelectionErrors();
    this.modal.dismiss();
  }

}
