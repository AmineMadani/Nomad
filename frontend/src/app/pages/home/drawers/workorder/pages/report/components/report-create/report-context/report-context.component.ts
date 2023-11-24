import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { InfiniteScrollCustomEvent, IonModal } from '@ionic/angular';
import { VLayerWtr } from 'src/app/core/models/layer.model';
import {
  Task,
  WTR_CODE_POSE,
  Workorder,
} from 'src/app/core/models/workorder.model';
import { LayerService } from 'src/app/core/services/layer.service';
import {
  MapEventService,
  MultiSelection,
} from 'src/app/core/services/map/map-event.service';
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
  ) {}

  @Input() workorder: Workorder;
  @Input() selectedTasks: Task[];
  @Output() onSaveWorkOrderState: EventEmitter<Workorder> = new EventEmitter();

  @ViewChild('modalReportContext') modal: IonModal;

  public originalOptions: VLayerWtr[] = [];
  public displayOptions: VLayerWtr[] = [];
  public valueKey: number;
  public querySearch: string = '';

  async ngOnInit() {
    const res = await this.layerService.getAllVLayerWtr();
    //Keep all the original options for the user before any filter
    this.originalOptions = res.sort((a, b) =>
      a.wtrLlabel.localeCompare(b.wtrLlabel)
    );
    if (
      !this.originalOptions.find(
        (option) =>
          this.selectedTasks[0].assObjTable == option.lyrTableName &&
          option.wtrId === this.selectedTasks[0].wtrId
      )
    ) {
      this.selectedTasks[0].wtrId = null;
    } else {
      //In case if the attribute value exist, it take the priority
      this.valueKey = this.selectedTasks[0].wtrId;
      this.selectedTasks[0].wtrCode = this.originalOptions.find(
        (val) => val.wtrId === this.selectedTasks[0].wtrId
      ).wtrCode;
      this.selectedTasks[0].astCode = this.originalOptions.find(
        (val) => val.lyrTableName === this.selectedTasks[0].assObjTable
      ).astCode;
    }

    // The 'Pose' reason is only accessible if its the initial value
    if (this.selectedTasks[0].wtrCode !== WTR_CODE_POSE) {
      // Else filter it from the list
      this.originalOptions = this.originalOptions.filter(
        (wtr) => wtr.wtrCode !== WTR_CODE_POSE
      );
    }

    const layerGrpActions = await this.layerService.getAllLayerGrpActions();
    const wtrPossibles = [];

    const lyrTableNames = [
      ...new Set(this.workorder.tasks.map((tsk) => tsk.assObjTable)),
    ];

    if (lyrTableNames.length > 0 && layerGrpActions?.length > 0) {
      for (const lyrGrpAct of layerGrpActions) {
        if (
          lyrTableNames.every((ltn) => lyrGrpAct.lyrTableNames.includes(ltn))
        ) {
          wtrPossibles.push(lyrGrpAct.wtrCode);
        }
      }
      if (wtrPossibles.length > 0) {
        this.originalOptions = this.originalOptions.filter((opt) =>
          wtrPossibles.includes(opt.wtrCode)
        );
      }
    }

    //Check if the label is editable
    this.getValueLabel();

    this.displayAndZoomTo(this.selectedTasks);
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
    this.displayOptions = [
      ...this.displayOptions,
      ...this.getFilterOptions(this.querySearch).slice(
        this.displayOptions.length,
        this.displayOptions.length + 50
      ),
    ];
    (e as InfiniteScrollCustomEvent).target.complete();
  }

  /**
   * Return the list of options filter on the paramMap data and the filter keys
   * @param query the filter use for the infinity scroll
   * @returns the list of options
   */
  public getFilterOptions(querySearch: string): any[] {
    let options = this.originalOptions?.filter(
      (option) =>
        this.selectedTasks[0].assObjTable == option.lyrTableName &&
        option.wtrLlabel.toLowerCase().indexOf(querySearch) > -1
    );
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
    const obj = this.originalOptions.find(
      (val) => val.wtrId === event.detail.value
    );
    this.valueKey = obj.wtrId;
    for (let task of this.selectedTasks) {
      task.wtrId = obj.wtrId;
      task.wtrCode = this.originalOptions.find(
        (val) => val.wtrId === task.wtrId
      ).wtrCode;
      task.astCode = this.originalOptions.find(
        (val) => val.lyrTableName === task.assObjTable
      ).astCode;
      task.report = null;
    }
    this.onSaveWorkOrderState.emit(this.workorder);
  }

  /**
   * Get the label to display
   * @returns the label
   */
  public getValueLabel(): string {
    if (this.selectedTasks[0].wtrId && this.originalOptions?.length > 0) {
      return this.originalOptions.find(
        (opt) => opt.wtrId === this.selectedTasks[0].wtrId
      ).wtrLlabel;
    }
    return '';
  }

  public convertBitsToBytes(x): string {
    let l = 0,
      n = parseInt(x, 10) || 0;

    const units = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
  }

  public getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private displayAndZoomTo(task: Task[]) {
    let featuresSelection: MultiSelection[] = [];

    this.mapService.onMapLoaded().subscribe(async () => {
      // Calculating the average value of both latitude and longitude
      const longitude =
        task
          .map((t) => t.longitude)
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          ) / task.length;
      const latitude =
        task
          .map((t) => t.latitude)
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          ) / task.length;

      await this.mapLayerService.moveToXY(longitude, latitude);
      await this.mapService.addEventLayer('task');

      featuresSelection = task.filter((t) => !t.assObjTable.includes('_xy')).map((t) => { return {
        id: t.id.toString(),
        source: t.assObjTable,
      }});

      // Displaying all layers selected
      [...new Set(task.filter((t) => !t.assObjTable.includes('_xy')).map((t) => t.assObjTable))].forEach(
        async (layer) => await this.mapService.addEventLayer(layer)
      );

      for (const t of task) {
        featuresSelection.push({ id: t.id.toString(), source: 'task' });
        if (!t.assObjTable.includes('_xy')) {
          featuresSelection.push({
            id: t.assObjRef,
            source: t.assObjTable,
          });
        }
      }

      this.mapEventService.highlighSelectedFeatures(
        this.mapService.getMap(),
        featuresSelection
      );

      this.mapLayerService.fitBounds(
        task.map((t) => {
          return [+t.longitude, +t.latitude];
        })
      );
    });
  }
}
