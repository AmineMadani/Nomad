import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { Layer } from 'src/app/core/models/layer.model';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapEventService, MultiSelection } from 'src/app/core/services/map/map-event.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import * as Maplibregl from 'maplibre-gl';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-report-asset',
  templateUrl: './report-asset.component.html',
  styleUrls: ['./report-asset.component.scss'],
})
export class ReportAssetComponent implements OnInit {

  constructor(
    private maplayerService: MapLayerService,
    private mapService: MapService,
    private mapEventService: MapEventService,
    private layerService: LayerService,
    private route: ActivatedRoute,
    private utils: UtilsService,
    private drawerService: DrawerService,
    private toastController: ToastController
  ) { }

  @Input() workorder: Workorder;
  @Input() selectedTasks: Task[];
  @Output() onSelectedTaskChange: EventEmitter<Task[]> = new EventEmitter();
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();
  @Output() onClosedWko: EventEmitter<boolean> = new EventEmitter();
  @Output() goToDateStep: EventEmitter<void> = new EventEmitter();

  public currentTasksSelected: Task[];
  public editTaskEquipment: Task;
  public draggableMarker: Maplibregl.Marker;
  public currentSelectionMessage: any;
  public inEditMode: boolean = false;
  public layerSelected: string;

  private refLayers: Layer[];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private oldEquipment: any;

  ngOnInit() {
    this.displayAndZoomToPlannedWko(this.workorder);

    this.layerService.getAllLayers().then((layers: Layer[]) => {
      this.refLayers = layers;
    });

    this.mapEventService.onFeatureSelected().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(async res => {
      if (this.editTaskEquipment) {
        this.editTaskEquipment.assObjRef = res.featureId;
        this.editTaskEquipment.assObjTable = res.layerKey;
        const asset = await this.layerService.getEquipmentByLayerAndId(this.editTaskEquipment.assObjTable, this.editTaskEquipment.assObjRef = res.featureId);
        this.editTaskEquipment.ctrId = asset.ctrId;
        this.workorder.ctrId = asset.ctrId;
        this.workorder.ctyId = asset.ctyId;
        if (this.draggableMarker) {
          this.draggableMarker.remove();
          this.draggableMarker = null;
        }
        this.draggableMarker = this.maplayerService.addMarker(
          res.x ? res.x : this.editTaskEquipment.longitude,
          res.y ? res.y : this.editTaskEquipment.latitude,
          asset.geom.coordinates,
          false,
          'green'
        );
      }
    });

    this.currentTasksSelected = this.selectedTasks;
    this.layerSelected = this.selectedTasks[0]?.assObjTable;

    // We select by default the asset in a mono case.
    if (this.workorder.tasks.length === 1 && this.selectedTasks.length === 0) {
      setTimeout(() => {
        this.onSelectTask(this.workorder.tasks[0]);
        // We set by default to edit mode if it's an xy
        if (this.workorder.tasks[0].assObjTable.includes('_xy')) {
          this.onEditEquipment(this.workorder.tasks[0]);
        }
      });
    }


  }

  /**
   * Select task
   * @param e event
   * @param task selected task
   */
  public onSelectTask(task: Task) {
    if (this.currentTasksSelected && this.currentTasksSelected.find(tsk => tsk.id == task.id)) {
      this.currentTasksSelected.find(tsk => tsk.id == task.id).isSelectedTask = false;
      this.currentTasksSelected = this.currentTasksSelected.filter(tsk => tsk.id != task.id);
      if(this.currentTasksSelected && this.currentTasksSelected.length == 0){
        this.layerSelected = null;
      }
    } else {
      this.currentTasksSelected.push(task);
      task.isSelectedTask = true;
      this.layerSelected = task.assObjTable;
    }
    this.onSelectedTaskChange.emit(this.currentTasksSelected);
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

  public onNewAsset() {
    this.drawerService.navigateTo(
      DrawerRouteEnum.NEW_ASSET,
      [],
      {
        draft: this.workorder.id,
        step: 'report'
      }
    );
  }

  /**
   * Edit equipment
   * @param tsk  Task equipment to edit
   */
  public onEditEquipment(tsk: Task) {
    this.inEditMode = true;
    this.showSelectionMessage();

    // Si ce n'est pas un xy ou un equipement temporaire
    // On place le marqueur sur les coordonnées de l'équipement en base
    if (!tsk.assObjTable.includes('_xy') && !tsk.assObjRef.startsWith('TMP-')) {
      this.layerService.getEquipmentByLayerAndId(tsk.assObjTable, tsk.assObjRef).then(async (result) => {
        // this.maplayerService.hideFeature('workorder', tsk.id.toString());
        this.draggableMarker = this.maplayerService.addMarker(
          tsk.longitude,
          tsk.latitude,
          result.geom.coordinates,
          false,
          'green'
        );
      });
    }
    // Sinon on place sur les coordonnées de la tâche
    else {
      this.draggableMarker = this.maplayerService.addMarker(
        tsk.longitude,
        tsk.latitude,
        [tsk.longitude as any, tsk.latitude as any],
        true,
        'green'
      );
    }
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
  public onValidateChangeEquipment() {
    if (this.inEditMode) {
      const tsk = this.workorder.tasks[0];

      let feature: any = this.maplayerService.getFeatureById("task", tsk.id + '');
      tsk.longitude = this.draggableMarker.getLngLat().lng;
      tsk.latitude = this.draggableMarker.getLngLat().lat;
      if (feature) {
        feature.geometry.coordinates = [this.draggableMarker.getLngLat().lng, this.draggableMarker.getLngLat().lat];
      } else {
        feature = {
          id: tsk.id + '',
          geometry: {
            coordinates: [this.draggableMarker.getLngLat().lng, this.draggableMarker.getLngLat().lat],
            type: "Point"
          }
        }
      }

      this.mapService.updateFeatureGeometry("task", feature);
      if (this.workorder.id > 0) {
        this.maplayerService.updateLocalGeometryFeatureById("task", tsk.id + '', feature.geometry.coordinates);
      }
      this.workorder.latitude = tsk.latitude;
      this.workorder.longitude = tsk.longitude;
      if (this.draggableMarker) {
        this.draggableMarker.remove();
        this.draggableMarker = null;
      }
      this.mapEventService.isFeatureFiredEvent = false;
      this.editTaskEquipment = null;
      this.onSaveWorkOrderState.emit();

      this.removeSelectionMessage();
    }
  }

  /**
   * Remove the equipment change
   * @param tsk task change to remove
   */
  public onRemoveChangeEquipment(tsk: Task) {
    this.inEditMode = false;

    if (!tsk.assObjTable.includes('_xy')) {
      this.mapService.getMap().setFeatureState(
        { source: tsk.assObjTable, id: tsk.assObjRef },
        { selected: false }
      );
    }
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
  public onItemHoverEnter(task: Task) {
    if (!task.assObjTable.includes('_xy')) {
      this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(), [{ id: task.id.toString(), source: 'task' }, { id: task.assObjRef, source: task.assObjTable }]);
    }
  }

  /**
   * Method to unhighligh feature when leave hover
   * @param task
   */
  public onItemHoverLeave(task: Task) {
    this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(), [])
  }

  /**
   * Check terminated report
   * @returns True if a task has a terminated report
   */
  public hasReportClosed() {
    return this.workorder.tasks.some(tsk => tsk.report?.dateCompletion);
  }

  public onCloseCircuit() {
    if (!this.utils.isMobilePlateform()) {
      this.goToDateStep.emit();
    }
    else {
      this.onClosedWko.emit(true);
    }
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private displayAndZoomToPlannedWko(workorder: Workorder) {

    let featuresSelection: MultiSelection[] = [];
    let geometries = [];

    this.mapService.onMapLoaded().subscribe(() => {
      this.maplayerService.moveToXY(this.workorder.longitude, this.workorder.latitude).then(() => {

        //Case display layers in params
        this.route.queryParams.subscribe(params => {
          if(params['layers']){
            const layers: string[] = params['layers'].split(',');
            for(let layer of layers){
              this.mapService.addEventLayer(layer);
            }
          }
        })

        this.mapService.addEventLayer('task').then(() => {
          for (let task of workorder.tasks) {
            this.mapService.addEventLayer(task.assObjTable).then(async () => {

              if (!task.assObjRef && !task.assObjTable.includes('_xy')) {
                task.assObjTable = 'aep_xy';
                this.onEditEquipment(task);
              }

              this.mapService.addGeojsonToLayer(this.workorder, 'task');
              setTimeout(() => {
                let feature: any = this.maplayerService.getFeatureById("task", task.id + '');
                feature.geometry.coordinates = [task.longitude, task.latitude];
                this.mapService.updateFeatureGeometry("task", feature);
                geometries.push(feature.geometry.coordinates);
                featuresSelection.push({
                  id: task.id.toString(),
                  source: 'task'
                });
                this.maplayerService.fitBounds(geometries, 19);
              }, 500);

              if (!task.assObjTable.includes('_xy')) {
                featuresSelection.push({
                  id: task.assObjRef,
                  source: task.assObjTable
                });
              }

              this.mapEventService.highlighSelectedFeatures(this.mapService.getMap(), featuresSelection);
            });
          }
        });
      });
    })
  }

  private async showSelectionMessage() {
    this.currentSelectionMessage = await this.toastController.create({
      message: 'Sélectionner patrimoine sur la carte',
      position: 'top',
      color: 'light'
    });
    await this.currentSelectionMessage.present();
  }

  private removeSelectionMessage() {
    if (this.currentSelectionMessage) {
      this.currentSelectionMessage.remove();
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
