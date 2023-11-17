import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { IonPopover, ToastController } from '@ionic/angular';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

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
    private toastController: ToastController,
    private drawingService: DrawingService,
    private workorderService: WorkorderService,
  ) { }

  @ViewChild('drawingSelectionPopover', { static: true }) drawingSelectionPopover: IonPopover;
  @ViewChild('assetTypeSelectionModal', { static: true }) assetTypeSelectionModal: IonPopover;

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
  public inAssetEditMode: boolean = false;
  public inMultiSelectionEditMode: boolean = false;
  public layerSelected: string;

  private refLayers: Layer[];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private oldEquipment: any;

  ngOnInit() {
    this.mapService.onMapLoaded().subscribe(() => {
      this.displayAndZoomToPlannedWko(this.workorder);

      this.initFeatureSelectionListeners();
    });

    this.layerService.getAllLayers().then((layers: Layer[]) => {
      this.refLayers = layers;
    });

    this.currentTasksSelected = this.selectedTasks;
    this.layerSelected = this.selectedTasks[0]?.assObjTable;

    // We select by default the asset in a mono case.
    if (this.workorder.tasks.length === 1 && this.selectedTasks.length === 0) {
      setTimeout(() => {
        this.onSelectTask(this.workorder.tasks[0]);
        // We set by default to edit mode if it's an xy
        if (this.workorder.tasks[0].assObjTable.includes('_xy')) {
          this.startAssetEditMode();
        }
      });
    }
  }

  private initFeatureSelectionListeners() {
    this.mapEventService.onFeatureSelected().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(async (feature) => {
      // Multiselection
      if (this.inMultiSelectionEditMode) {
        await this.addNewFeatures(feature);
      }
      // Asset selection
      else if (this.inAssetEditMode) {
        this.editTaskEquipment.assObjRef = feature.featureId;
        this.editTaskEquipment.assObjTable = feature.layerKey;
        const asset = await this.layerService.getEquipmentByLayerAndId(this.editTaskEquipment.assObjTable, this.editTaskEquipment.assObjRef = feature.featureId);
        this.editTaskEquipment.ctrId = asset.ctrId;
        this.workorder.ctrId = asset.ctrId;
        this.workorder.ctyId = asset.ctyId;
        if (this.draggableMarker) {
          this.draggableMarker.remove();
          this.draggableMarker = null;
        }
        this.draggableMarker = this.maplayerService.addMarker(
          feature.x ? feature.x : this.editTaskEquipment.longitude,
          feature.y ? feature.y : this.editTaskEquipment.latitude,
          asset.geom.coordinates,
          false,
          'green'
        );
      }
    });

    this.mapEventService
      .onMultiFeaturesSelected()
      .pipe(
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async (features) => {
        if (this.inMultiSelectionEditMode) {
          await this.addNewFeatures(features);
        }
      });
  }

  /**
   * Select task
   * @param e event
   * @param task selected task
   */
  public onSelectTask(task: Task) {
    if (this.currentTasksSelected && this.currentTasksSelected.find(tsk => tsk.id == task.id)) {
      this.currentTasksSelected.find(tsk => tsk.id == task.id).isSelectedTask = false;
      this.currentTasksSelected = this.currentTasksSelected.filter(tsk => tsk.id != task.id && !tsk.report?.dateCompletion);
      if (this.currentTasksSelected && this.currentTasksSelected.length == 0){
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
    // Si ce n'est pas un xy ou un equipement temporaire
    // On place le marqueur sur les coordonnées de l'équipement en base
    if (!tsk.assObjTable.includes('_xy') && !tsk.assObjRef.startsWith('TMP-')) {
      this.layerService.getEquipmentByLayerAndId(tsk.assObjTable, tsk.assObjRef).then(async (result) => {
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
    // If we are in asset modification
    if (this.inAssetEditMode) {
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

      const taskOnTheSameEquipmentIndex = this.workorder.tasks.findIndex((t) => t.assObjRef === tsk.assObjRef && t.id !== tsk.id);
      if (taskOnTheSameEquipmentIndex > -1) {
        this.mapService.removePoint('task', this.workorder.tasks[taskOnTheSameEquipmentIndex].id.toString());
        this.workorder.tasks.splice(taskOnTheSameEquipmentIndex, 1);
      }

      this.onSaveWorkOrderState.emit();

      this.stopAssetEditMode();
    }

    // We stop edit mode for the multi selection
    if (this.inMultiSelectionEditMode) {
      this.stopMultiSelectionEditMode();
    }
  }

  /**
   * Remove the equipment change
   * @param tsk task change to remove
   */
  public onRemoveChangeEquipment() {
    if (this.inAssetEditMode) {
      const tsk = this.workorder.tasks[0];

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

  public onMultiSelection() {
    this.drawingSelectionPopover.present();
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private displayAndZoomToPlannedWko(workorder: Workorder) {
    let featuresSelection: MultiSelection[] = [];
    let geometries = [];

    this.maplayerService.moveToXY(this.workorder.longitude, this.workorder.latitude).then(() => {
      //Case display layers in params
      this.route.queryParams.subscribe(params => {
        if (params['layers']) {
          const layers: string[] = params['layers'].split(',');
          for (let layer of layers) {
            this.mapService.addEventLayer(layer);
          }
        }
      });

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
              if (feature) {
                feature.geometry.coordinates = [task.longitude, task.latitude];
                this.mapService.updateFeatureGeometry("task", feature);
                geometries.push(feature.geometry.coordinates);
                featuresSelection.push({
                  id: task.id.toString(),
                  source: 'task'
                });
                this.maplayerService.fitBounds(geometries, 19);
              }
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
  }

  public startAssetEditMode() {
    this.onEditEquipment(this.workorder.tasks[0]);
    this.inAssetEditMode = true;
    this.showSelectionMessage();
  }

  public startMultiSelectionEditMode(mode: string): void {
    this.mapEventService.isFeatureFiredEvent = true;

    switch (mode) {
      case 'polygon':
        this.drawingService.setDrawMode('draw_polygon');
        break;
      case 'rect':
        this.drawingService.setDrawMode('draw_rectangle');
        break;
    }

    this.drawingSelectionPopover.dismiss();

    this.inMultiSelectionEditMode = true;
    this.showSelectionMessage();
  }

  private stopAssetEditMode() {
    if (!this.inMultiSelectionEditMode) {
      this.removeSelectionMessage();
    }

    this.inAssetEditMode = false;
    this.onSaveWorkOrderState.emit();
  }

  public cancelAssetEditMode() {
    this.onRemoveChangeEquipment()
    this.stopAssetEditMode();
  }

  public onAllSelectedChange() {
    if (this.isAllElementSelected()) {
      // Unselect all task
      for (const task of this.workorder.tasks.filter((tsk) => tsk.isSelectedTask && !tsk.report?.dateCompletion)) {
        this.onSelectTask(task);
      }
    } else {
      // Only select the all the tasks of the first layer key find
      if (!this.layerSelected) this.layerSelected = this.workorder.tasks[0].assObjTable;
      for (const task of this.workorder.tasks.filter((tsk) => !tsk.isSelectedTask && tsk.assObjTable === this.layerSelected)) {
        this.onSelectTask(task);
      }
    }
  }

  public isAllElementSelected() {
    const tasks = this.workorder.tasks.filter((tsk) => tsk.assObjTable === this.layerSelected);
    if (tasks.length > 0) {
      return tasks.every((tsk) => tsk.isSelectedTask);
    } else {
      return false;
    }
  }

  private stopMultiSelectionEditMode() {
    if (!this.inAssetEditMode) {
      this.removeSelectionMessage();
      this.mapEventService.isFeatureFiredEvent = false;
    }

    this.inMultiSelectionEditMode = false;
    this.drawingService.deleteDrawing();
    this.drawingService.setDrawActive(false);
    this.displayAndZoomToPlannedWko(this.workorder);
    this.onSaveWorkOrderState.emit();
  }

  private async showSelectionMessage() {
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }

    this.currentSelectionMessage = await this.toastController.create({
      message: 'Sélectionner patrimoine sur la carte',
      position: 'top',
      color: 'light'
    });
    await this.currentSelectionMessage.present();
  }

  private async removeSelectionMessage() {
    this.currentSelectionMessage.remove();
  }

  private async addNewFeatures(features: any | any[]): Promise<void> {
    if (!Array.isArray(features)) {
      features = [
        {
          ...this.maplayerService.getFeatureById(
            features.layerKey,
            features.featureId
          )['properties'],
          lyrTableName: features.layerKey,
        },
      ];
    } else {
      features = features.map((f) => {
        return {
          ...this.maplayerService.getFeatureById(f.source, f.id)['properties'],
          lyrTableName: f.source,
        };
      });
    }

    features = this.utils.removeDuplicatesFromArr(
      [...features],
      'id'
    ).filter((feature) => feature.lyrTableName !== 'task');

    this.workorderService
      .getAllWorkorderTaskStatus()
      .then(async (lStatus) => {
        // When editing the asset of a workorder
        // If the workorder has tasks on XY then remove them from the list
        this.workorder.tasks = this.workorder.tasks.filter((t) => !t.assObjTable.includes('_xy'));

        for (let f of features) {
          if (!this.workorder.tasks.find((t) => t.assObjRef === f.id)) {
            const task = {
              id: this.utils.createCacheId(),
              assObjTable: f.lyrTableName,
              assObjRef: f.id,
              latitude: f.y,
              longitude: f.x,
              wtrId: this.workorder.tasks[0]?.wtrId ?? null,
              wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
            };

            this.workorder.tasks.push(task);

            if (!this.layerSelected || task.assObjTable === this.layerSelected) {
              this.onSelectTask(task);
            }
          }
        }

        this.stopMultiSelectionEditMode();
      });
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
