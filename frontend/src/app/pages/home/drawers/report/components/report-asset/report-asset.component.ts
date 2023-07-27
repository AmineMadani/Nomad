import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { ExploitationService } from 'src/app/core/services/exploitation.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';

@Component({
  selector: 'app-report-asset',
  templateUrl: './report-asset.component.html',
  styleUrls: ['./report-asset.component.scss'],
})
export class ReportAssetComponent implements OnInit {

  constructor(
    private referentialService: ReferentialService,
    private layerService: LayerService,
    private mapService: MapService,
    private mapEventService: MapEventService
  ) { }

  @Input() workorder: Workorder;
  @Input() selectedTask: Task;
  @Output() onSelectedTaskChange: EventEmitter<Task> = new EventEmitter();
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();

  public currentTaskSelected: Task;
  public editTaskEquipment: Task;
  public draggableMarker: any;

  private refLayers: any[];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private oldEquipment: any;

  ngOnInit() {

    this.referentialService.getReferential('layers').then(layers => {
      this.refLayers = layers;
    });

    this.mapEventService.onFeatureSelected().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (this.editTaskEquipment) {
        this.editTaskEquipment.assObjRef = res.featureId;
        this.editTaskEquipment.assObjTable = "asset." + res.layerKey;
        this.layerService.getCoordinateFeaturesById(res.layerKey, res.featureId).then(result => {
          if (this.draggableMarker) {
            this.draggableMarker.remove();
            this.draggableMarker = null;
          }
          this.draggableMarker = this.layerService.addMarker(res.x ? res.x : this.editTaskEquipment.longitude, res.y ? res.y : this.editTaskEquipment.latitude, result);
        })
      }
    });

    this.currentTaskSelected = this.selectedTask;
  }

  /**
   * Select task
   * @param e event
   * @param task selected task
   */
  public onSelectTask(e: Event, task: Task) {
    if (this.currentTaskSelected && this.currentTaskSelected.id == task.id) {
      this.currentTaskSelected = null;
    } else {
      this.currentTaskSelected = task;
    }
    this.onSelectedTaskChange.emit(this.currentTaskSelected);
  }

  /**
   * Get layer table name label
   * @param layerKey the layer key
   * @returns the label
   */
  public getLyrLabel(layerKey: string): string {
    if (this.refLayers) {
      return this.refLayers.find(ref => ref.lyrTableName == layerKey).lyrSlabel;
    } else {
      return layerKey;
    }
  }

  /**
   * Edit equipment
   * @param tsk  Task equipment to edit
   */
  public onEditEquipment(tsk: Task) {
    this.layerService.getCoordinateFeaturesById(tsk.assObjTable.replace("asset.", ""), tsk.assObjRef).then(result => {
      this.draggableMarker = this.layerService.addMarker(tsk.longitude, tsk.latitude, result);
    })
    this.mapEventService.isFeatureFiredEvent = true;
    this.editTaskEquipment = tsk;
    this.oldEquipment = {
      featureId: tsk.assObjRef,
      layerKey: tsk.assObjTable,
      x: tsk.longitude,
      y: tsk.latitude
    }
  }

  /**
   * Validate the equipment change
   * @param tsk the task to update
   */
  public onValidateChangeEquipment(tsk: Task) {
    let feature: any = this.layerService.getFeatureById("workorder", tsk.id + '');
    feature.geometry.coordinates = [this.draggableMarker.getLngLat().lng, this.draggableMarker.getLngLat().lat];
    this.mapService.updateFeature("workorder", feature);
    this.layerService.updateLocalGeometryFeatureById("workorder", tsk.id + '', feature.geometry.coordinates);
    tsk.longitude = this.draggableMarker.getLngLat().lng;
    tsk.latitude = this.draggableMarker.getLngLat().lat;
    if (this.draggableMarker) {
      this.draggableMarker.remove();
      this.draggableMarker = null;
    }
    this.mapEventService.isFeatureFiredEvent = false;
    this.editTaskEquipment = null;
    this.onSaveWorkOrderState.emit();
  }

  /**
   * Remove the equipment change
   * @param tsk task change to remove
   */
  public onRemoveChangeEquipment(tsk: Task) {
    this.mapService.getMap().setFeatureState(
      { source: tsk.assObjTable.replace("asset.", ""), id: tsk.assObjRef },
      { selected: false }
    );
    tsk.assObjRef = this.oldEquipment.featureId;
    tsk.assObjTable = this.oldEquipment.layerKey;
    this.mapEventService.isFeatureFiredEvent = false;
    this.editTaskEquipment = null;
    if (this.draggableMarker) {
      this.draggableMarker.remove();
      this.draggableMarker = null;
    }
  }

  ngOnDestroy(): void {
    if (this.draggableMarker) {
      this.draggableMarker.remove();
    }
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.mapEventService.isFeatureFiredEvent = false;
  }

}
