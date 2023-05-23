import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormDefinition, FormSelectReferential } from '../../models/form.model';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { InfiniteScrollCustomEvent, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-form-select-referential',
  templateUrl: './form-select-referential.component.html',
  styleUrls: ['./form-select-referential.component.scss'],
})
export class FormSelectReferentialComponent implements OnInit {
  constructor(
    private referentialService: ReferentialService
  ) { }

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() paramMap: Map<string, string>;
  @Input() edit: boolean;

  public attributes: FormSelectReferential;
  public originalOptions: any[] = [];
  public displayOptions: any[] = [];
  public querySearch: string = "";
  public valueKey: string;
  public disabled: boolean; false;

  @ViewChild('modalReferential') modal: IonModal;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSelectReferential;
    this.referentialService.getReferential(this.attributes.repository).then(res => {
      //Keep all the original options for the user before any filter
      this.originalOptions = res.sort((a, b) => a[this.attributes.repositoryValue].localeCompare(b[this.attributes.repositoryValue]));

      //In case if the attribute value exist, it take the priority
      if (this.attributes.value) {
        this.control.setValue(this.attributes.value);
        const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == this.attributes.value.toString());
        this.valueKey = obj[this.attributes.repositoryKey].toString();
      }
    });
  }

  /**
   * Get the label to display
   * @returns the label
   */
  getValueLabel(): string {
    //Check if the label is editable
    if (!this.definition.editable && this.control.value && this.control.value.length > 0) {
      this.disabled = true;
    }

    // In this code block, the paramMap is checked for a single value of the current definition.key. 
    // If found, the code looks for a matching object in the filtered options and updates the control value accordingly. 
    // If not found, it returns the repositoryValue based on the control value. 
    // If the paramMap has multiple values, the code directly returns the corresponding repositoryValue based on the control value. 
    if (this.paramMap.get(this.definition.key)?.split(',').length == 1) {
      const obj = this.getFilterOptions(this.querySearch).find(val => val[this.attributes.repositoryKey].toString() == this.paramMap.get(this.definition.key));
      if (obj) {
        this.control.setValue(this.valueKey);
        this.valueKey = obj[this.attributes.repositoryKey]?.toString();
        return obj[this.attributes.repositoryValue];
      } else {
        if (this.control.value && this.control.value != "") {
          const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == this.control.value);
          return obj ? obj[this.attributes.repositoryValue] : '';
        }
      }
    } else {
      if (this.control.value && this.control.value != "") {
        const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == this.control.value);
        return obj ? obj[this.attributes.repositoryValue] : '';
      }
    }
    return "";
  }

  /**
   * Return the list of options filter on the paramMap data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  getFilterOptions(query): any[] {
    let preSelectId = [];
    if (this.paramMap.get(this.definition.key)?.split(',').length > 1) {
      preSelectId = this.paramMap.get(this.definition.key)?.split(',');
    }
    if (this.attributes.filters) {
      for (let filter of this.attributes.filters) {
        if (this.paramMap.get(filter)) {
          let options = this.originalOptions?.filter(option => option[this.attributes.repositoryValue].toLowerCase().indexOf(query) > -1 && ((option[filter] ? option[filter] : "xy") == this.paramMap.get(filter) || this.paramMap.get(this.definition.key) == option[this.definition.key] || this.attributes.value == option[this.definition.key]));
          if(preSelectId.length > 0){
            options = options.filter(option => preSelectId.includes(option['id'].toString()));
          }
          return options;
        }
      }
    }
    let options = this.originalOptions.filter(option => option[this.attributes.repositoryValue].toLowerCase().indexOf(query) > -1);
    if(preSelectId.length > 0){
      options = options.filter(option => preSelectId.includes(option['id'].toString()));
    }
    return options;
  }

  /**
   * Method to load the next options from the infinity scroll
   * @param e the ion infinity event
   */
  onIonInfinite(e) {
    this.displayOptions = [...this.displayOptions, ...this.getFilterOptions(this.querySearch).slice(this.displayOptions.length, this.displayOptions.length + 50)];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  /**
   * Method to filter on the search input
   * @param e the ion input event
   */
  onHandleInput(event) {
    this.querySearch = event.target.value.toLowerCase();
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  /**
   * Action on the selected data
   * @param event the ion radio event
   */
  onRadioChange(event) {
    const obj = this.originalOptions.find(val => val[this.attributes.repositoryKey].toString() == event.detail.value);
    this.valueKey = obj[this.attributes.repositoryKey].toString();
    this.control.setValue(this.valueKey);
    if (this.paramMap.get(this.definition.key)?.split(',').length < 1) {
      this.paramMap.set(this.definition.key, this.control.value);
    }
  }

  /**
   * Method to open the modal and filter the options before
   */
  onOpenModal(){
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
    this.modal.present();
  }
}
