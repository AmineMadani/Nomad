import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { MapEventService, MultiSelection } from 'src/app/core/services/map/map-event.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
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
    private maplayerService: MapLayerService,
    private mapService: MapService,
    private mapEventService: MapEventService,
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

    this.displayAndZoomTo(this.workorder);

    this.referentialService.getReferential('layers').then(layers => {
      this.refLayers = layers;
    });

    this.mapEventService.onFeatureSelected().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (this.editTaskEquipment) {
        this.editTaskEquipment.assObjRef = res.featureId;
        this.editTaskEquipment.assObjTable = "asset." + res.layerKey;
        this.maplayerService.getCoordinateFeaturesById(res.layerKey, res.featureId).then(result => {
          if (this.draggableMarker) {
            this.draggableMarker.remove();
            this.draggableMarker = null;
          }
          this.draggableMarker = this.maplayerService.addMarker(res.x ? res.x : this.editTaskEquipment.longitude, res.y ? res.y : this.editTaskEquipment.latitude, result);
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
    this.maplayerService.getCoordinateFeaturesById(tsk.assObjTable.replace("asset.", ""), tsk.assObjRef).then(result => {
      this.draggableMarker = this.maplayerService.addMarker(tsk.longitude, tsk.latitude, result);
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
    let feature: any = this.maplayerService.getFeatureById("workorder", tsk.id + '');
    feature.geometry.coordinates = [this.draggableMarker.getLngLat().lng, this.draggableMarker.getLngLat().lat];
    this.mapService.updateFeature("workorder", feature);
    this.maplayerService.updateLocalGeometryFeatureById("workorder", tsk.id + '', feature.geometry.coordinates);
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

  /**
   * Method to highligh feature when enter hover
   * @param task 
   */
  public onItemHoverEnter(task: Task){
    this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(),[{id:task.id.toString(),source:'workorder'},{id:task.assObjRef,source:task.assObjTable.replace("asset.", "")}]);
  }

  /**
   * Method to unhighligh feature when leave hover
   * @param task 
   */
  public onItemHoverLeave(task: Task){
    this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(),[])
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private displayAndZoomTo(workorder: Workorder) {

    let featuresSelection: MultiSelection[] = [];
    let geometries = [];

    this.mapService.onMapLoaded().subscribe(() => {
      this.maplayerService.moveToXY(this.workorder.longitude, this.workorder.latitude).then(() => {
        this.mapService.addEventLayer('workorder').then(() => {
          for (let task of workorder.tasks) {
            this.mapService.addEventLayer(task.assObjTable.replace('asset.', '')).then(() => {
              let feature: any = this.maplayerService.getFeatureById("workorder", task.id + '');
              feature.geometry.coordinates = [task.longitude, task.latitude];
              this.mapService.updateFeature("workorder", feature);
              geometries.push(feature.geometry.coordinates);

              featuresSelection.push({
                id: task.id.toString(),
                source: 'workorder'
              });
              featuresSelection.push({
                id: task.assObjRef,
                source: task.assObjTable.replace('asset.', '')
              });

              this.mapEventService.highlighSelectedFeatures(this.mapService.getMap(), featuresSelection);
              this.maplayerService.fitBounds(geometries, 19);
            });
          }
        });
      });
    })
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
