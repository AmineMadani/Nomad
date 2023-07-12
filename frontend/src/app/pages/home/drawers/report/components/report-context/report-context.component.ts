import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonModal } from '@ionic/angular';
import { CustomTask } from 'src/app/core/models/workorder.model';
import { ReferentialService } from 'src/app/core/services/referential.service';

@Component({
  selector: 'app-report-context',
  templateUrl: './report-context.component.html',
  styleUrls: ['./report-context.component.scss'],
})
export class ReportContextComponent implements OnInit {

  constructor(
    private referentialService: ReferentialService
  ) { }

  @Input() task: CustomTask;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  @ViewChild('modalReportContext') modal: IonModal;

  public originalOptions: any[] = [];
  public displayOptions: any[] = [];
  public valueKey: string;
  public querySearch: string = "";

  ngOnInit() {
    this.referentialService.getReferential("v_layer_wtr").then(res => {
      //Keep all the original options for the user before any filter
      this.originalOptions = res.sort((a, b) => a['wtr_llabel'].localeCompare(b['wtr_llabel']));

      if (!this.originalOptions.find(option => this.task.assObjTable.replace("asset.", "") == option['lyr_table_name'] && option["wtr_id"].toString() == this.task.wtrId)) {
        this.task.wtrId = null;
      } else {
        //In case if the attribute value exist, it take the priority
        const obj = this.originalOptions.find(val => val['wtr_id'].toString() == this.task.wtrId.toString());
        this.valueKey = obj['wtr_id'].toString();
      }

      //Check if the label is editable
      this.getValueLabel();
    });
  }

  /**
   * Method to open the modal and filter the options before
   */
  onOpenModal() {
    this.querySearch = '';
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
    this.modal.present();
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
   * Return the list of options filter on the paramMap data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  getFilterOptions(querySearch: string): any[] {
    let options = this.originalOptions?.filter(option => this.task.assObjTable.replace("asset.", "") == option['lyr_table_name'] && option["wtr_llabel"].toLowerCase().indexOf(querySearch) > -1);
    return options;
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
    const obj = this.originalOptions.find(val => val['wtr_id'].toString() == event.detail.value);
    this.valueKey = obj['wtr_id'].toString();
    this.task.wtrId = obj['wtr_id'].toString();
    this.onSaveWorkOrderState.emit();
  }

  /**
   * Get the label to display
   * @returns the label
   */
  getValueLabel(): string {
    if (this.task.wtrId && this.originalOptions?.length > 0) {
      return this.originalOptions.find(opt => opt['wtr_id'] == this.task.wtrId)['wtr_llabel'];
    }
    return "";
  }

}
