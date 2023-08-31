import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonModal } from '@ionic/angular';
import { VLayerWtr } from 'src/app/core/models/layer.model';
import { Task } from 'src/app/core/models/workorder.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapEventService, MultiSelection } from 'src/app/core/services/map/map-event.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-report-context',
  templateUrl: './report-context.component.html',
  styleUrls: ['./report-context.component.scss'],
})
export class ReportContextComponent implements OnInit {

  constructor(
    private layerService: LayerService,
    private mapService: MapService,
    private mapLayerService: MapLayerService,
    private mapEventService: MapEventService
  ) { }

  @Input() task: Task;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  @ViewChild('modalReportContext') modal: IonModal;

  public originalOptions: VLayerWtr[] = [];
  public displayOptions: VLayerWtr[] = [];
  public valueKey: number;
  public querySearch: string = "";

  ngOnInit() {
    this.layerService.getAllVLayerWtr().subscribe((res: VLayerWtr[]) => {
      //Keep all the original options for the user before any filter
      this.originalOptions = res.sort((a, b) => a.wtrLlabel.localeCompare(b.wtrLlabel));

      if (!this.originalOptions.find(option => this.task.assObjTable.replace("asset.", "") == option.lyrTableName && option.wtrId === this.task.wtrId)) {
        this.task.wtrId = null;
      } else {
        //In case if the attribute value exist, it take the priority
        const obj = this.originalOptions.find(val => val.wtrId === this.task.wtrId);
        this.valueKey = obj.wtrId;
        this.task.wtrCode = obj.wtrCode;
        this.task.astCode = obj.astCode;
      }

      //Check if the label is editable
      this.getValueLabel();
    });

    this.displayAndZoomTo(this.task);
  }

  /**
   * Method to open the modal and filter the options before
   */
  public onOpenModal() {
    this.querySearch = '';
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
    this.modal.present();
  }

  /**
   * Method to load the next options from the infinity scroll
   * @param e the ion infinity event
   */
  public onIonInfinite(e) {
    this.displayOptions = [...this.displayOptions, ...this.getFilterOptions(this.querySearch).slice(this.displayOptions.length, this.displayOptions.length + 50)];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  /**
   * Return the list of options filter on the paramMap data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  public getFilterOptions(querySearch: string): any[] {
    let options = this.originalOptions?.filter(option => this.task.assObjTable.replace("asset.", "") == option.lyrTableName && option.wtrLlabel.toLowerCase().indexOf(querySearch) > -1);
    return options;
  }

  /**
   * Method to filter on the search input
   * @param e the ion input event
   */
  public onHandleInput(event) {
    this.querySearch = event.target.value.toLowerCase();
    this.displayOptions = this.getFilterOptions(this.querySearch).slice(0, 50);
  }

  /**
   * Action on the selected data
   * @param event the ion radio event
   */
  public onRadioChange(event) {
    const obj = this.originalOptions.find(val => val.wtrId === event.detail.value);
    this.valueKey = obj.wtrId;
    this.task.wtrId = obj.wtrId;
    this.task.wtrCode = obj.wtrCode;
    this.onSaveWorkOrderState.emit();
  }

  /**
   * Get the label to display
   * @returns the label
   */
  public getValueLabel(): string {
    if (this.task.wtrId && this.originalOptions?.length > 0) {
      return this.originalOptions.find(opt => opt.wtrId === this.task.wtrId).wtrLlabel;
    }
    return "";
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private displayAndZoomTo(task: Task) {

    let featuresSelection: MultiSelection[] = [];

    this.mapService.onMapLoaded().subscribe(() => {
      this.mapLayerService.moveToXY(task.longitude, task.latitude).then(() => {
        this.mapService.addEventLayer('task').then(() => {
          this.mapService.addEventLayer(task.assObjTable.replace('asset.', "")).then(() => {

            featuresSelection.push({
              id: task.id.toString(),
              source: 'task'
            });
            featuresSelection.push({
              id: task.assObjRef,
              source: task.assObjTable.replace('asset.', '')
            });

            if (!task.assObjTable.includes('_xy')) {
              this.mapEventService.highlighSelectedFeatures(this.mapService.getMap(), featuresSelection);
            }
            this.mapLayerService.fitBounds([[task.longitude, task.latitude]], 21);
          });
        });
      });
    })
  }

}
