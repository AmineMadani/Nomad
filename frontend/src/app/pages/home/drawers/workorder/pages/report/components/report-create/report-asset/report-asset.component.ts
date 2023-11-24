import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { Layer } from 'src/app/core/models/layer.model';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import {
  MapEventService,
  MultiSelection,
} from 'src/app/core/services/map/map-event.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import * as Maplibregl from 'maplibre-gl';
import { IonPopover, ModalController, ToastController } from '@ionic/angular';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MultiAssetsModalComponent } from '../../../../multi-assets-modal/multi-assets-modal.component';
import { MonoXyRulesModalComponent } from '../../mono-xy-rules-modal/mono-xy-rules-modal.component';

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
    private toastController: ToastController,
    private drawingService: DrawingService,
    private workorderService: WorkorderService,
    private modalCtrl: ModalController,
    private drawerService: DrawerService
  ) {}

  @ViewChild('drawingSelectionPopover', { static: true })
  drawingSelectionPopover: IonPopover;
  @ViewChild('assetTypeSelectionModal', { static: true })
  assetTypeSelectionModal: IonPopover;

  @Input() workorder: Workorder;
  @Input() selectedTasks: Task[];
  @Output() onSelectedTaskChange: EventEmitter<Task[]> = new EventEmitter();
  @Output() onSaveWorkOrderState: EventEmitter<Workorder> = new EventEmitter();
  @Output() onClosedWko: EventEmitter<boolean> = new EventEmitter();
  @Output() goToDateStep: EventEmitter<void> = new EventEmitter();

  public currentTasksSelected: Task[];
  public editTaskEquipment: Task;
  public draggableMarker: Maplibregl.Marker;
  public currentSelectionMessage: any;
  public inAssetEditMode: boolean = false;
  public inMultiSelectionEditMode: boolean = false;
  public layerSelected: string;
  public loading: boolean = false;

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

  ngOnDestroy(): void {
    if (this.draggableMarker) {
      this.draggableMarker.remove();
    }
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.mapEventService.isFeatureFiredEvent = false;
  }

  /**
   * Select task
   * @param e event
   * @param task selected task
   */
  public onSelectTask(task: Task) {
    if (
      this.currentTasksSelected &&
      this.currentTasksSelected.find((tsk) => tsk.id == task.id)
    ) {
      this.currentTasksSelected.find(
        (tsk) => tsk.id == task.id
      ).isSelectedTask = false;
      this.currentTasksSelected = this.currentTasksSelected.filter(
        (tsk) => tsk.id != task.id && !tsk.report?.dateCompletion
      );
      if (this.currentTasksSelected && this.currentTasksSelected.length == 0) {
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
      return this.refLayers.find((ref) => ref.lyrTableName == layerKey)
        .lyrSlabel;
    } else {
      return layerKey;
    }
  }

  public onNewAsset() {
    for (let task of this.workorder.tasks) {
      task.isSelectedTask = false;
    }
    this.selectedTasks = [];
    this.onSaveWorkOrderState.emit(this.workorder);
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
    if (!this.inAssetEditMode) {
      this.inAssetEditMode = true;
    }
    if (this.draggableMarker?.isDraggable()) {
      this.draggableMarker.remove();
    }
    // Si ce n'est pas un xy ou un equipement temporaire
    // On place le marqueur sur les coordonnées de l'équipement en base
    if (!tsk.assObjTable.includes('_xy') && !tsk.assObjRef.startsWith('TMP-')) {
      this.layerService
        .getEquipmentByLayerAndId(tsk.assObjTable, tsk.assObjRef)
        .then(async (result) => {
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
      y: tsk.latitude,
    };
  }

  /**
   * Validate the equipment change
   * @param tsk the task to update
   */
  public onValidateChangeEquipment(t?: Task) {
    // If we are in asset modification
    if (this.inAssetEditMode) {
      const tsk = t ? t : this.editTaskEquipment;

      let feature: any = this.maplayerService.getFeatureById(
        'task',
        tsk.id + ''
      );
      tsk.longitude = this.draggableMarker.getLngLat().lng;
      tsk.latitude = this.draggableMarker.getLngLat().lat;
      if (feature) {
        feature.geometry.coordinates = [
          this.draggableMarker.getLngLat().lng,
          this.draggableMarker.getLngLat().lat,
        ];
      } else {
        feature = {
          id: tsk.id + '',
          geometry: {
            coordinates: [
              this.draggableMarker.getLngLat().lng,
              this.draggableMarker.getLngLat().lat,
            ],
            type: 'Point',
          },
        };
      }

      this.mapService.updateFeatureGeometry('task', feature);
      if (this.workorder.id > 0) {
        this.maplayerService.updateLocalGeometryFeatureById(
          'task',
          tsk.id + '',
          feature.geometry.coordinates
        );
      }
      this.workorder.latitude = tsk.latitude;
      this.workorder.longitude = tsk.longitude;
      if (this.draggableMarker) {
        this.draggableMarker.remove();
        this.draggableMarker = null;
      }
      this.mapEventService.isFeatureFiredEvent = false;
      this.editTaskEquipment = null;

      const taskOnTheSameEquipmentIndex = this.workorder.tasks.findIndex(
        (t) => t.assObjRef === tsk.assObjRef && t.id !== tsk.id
      );
      if (taskOnTheSameEquipmentIndex > -1) {
        this.mapService.removePoint(
          'task',
          this.workorder.tasks[taskOnTheSameEquipmentIndex].id.toString()
        );
        this.workorder.tasks.splice(taskOnTheSameEquipmentIndex, 1);
      }
      this.onSaveWorkOrderState.emit(this.workorder);

      this.stopAssetEditMode();
    }

    // We stop edit mode for the multi selection
    if (this.inMultiSelectionEditMode) {
      this.stopMultiSelectionEditMode();
    }
  }

  public removeTask(tsk: Task): void {
    this.workorder.tasks = this.workorder.tasks.filter((t) => t.id !== tsk.id);
    if (this.selectedTasks.find((t) => t.id === tsk.id)) {
      this.selectedTasks = this.selectedTasks.filter((t) => t.id !== tsk.id);
    }
    this.mapService.removePoint('task', tsk.id.toString());
  }

  /**
   * Remove the equipment change
   * @param tsk task change to remove
   */
  public onRemoveChangeEquipment(t?: Task) {
    if (this.inAssetEditMode) {
      const tsk = t ?? this.workorder.tasks[0];

      if (!tsk.assObjTable.includes('_xy')) {
        this.mapService
          .getMap()
          .setFeatureState(
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
      this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(), [
        { id: task.id.toString(), source: 'task' },
        { id: task.assObjRef, source: task.assObjTable },
      ]);
    }
  }

  /**
   * Method to unhighligh feature when leave hover
   * @param task
   */
  public onItemHoverLeave(task: Task) {
    this.mapEventService.highlightHoveredFeatures(this.mapService.getMap(), []);
  }

  /**
   * Check terminated report
   * @returns True if a task has a terminated report
   */
  public hasReportClosed() {
    return this.workorder.tasks && this.workorder.tasks.some((tsk) => tsk.report?.dateCompletion);
  }

  public onCloseCircuit() {
    if (!this.utils.isMobilePlateform()) {
      this.goToDateStep.emit();
    } else {
      this.onClosedWko.emit(true);
    }
  }

  public onMultiSelection() {
    this.drawingSelectionPopover.present();
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

  public cancelAssetEditMode() {
    this.onRemoveChangeEquipment();
    this.stopAssetEditMode();
  }

  public onAllSelectedChange() {
    if (this.isAllElementSelected()) {
      // Unselect all task
      for (const task of this.workorder.tasks.filter(
        (tsk) => tsk.isSelectedTask && !tsk.report?.dateCompletion
      )) {
        this.onSelectTask(task);
      }
    } else {
      // Only select the all the tasks of the first layer key find
      if (!this.layerSelected)
        this.layerSelected = this.workorder.tasks.filter((t) => !t.report?.dateCompletion)?.[0].assObjTable;
      for (const task of this.workorder.tasks.filter(
        (tsk) => !tsk.isSelectedTask && tsk.assObjTable === this.layerSelected
      )) {
        this.onSelectTask(task);
      }
    }
  }

  public isAllElementSelected() {
    const tasks = this.workorder.tasks.filter(
      (tsk) => tsk.assObjTable === this.layerSelected
    );
    if (tasks.length > 0) {
      return tasks.every((tsk) => tsk.isSelectedTask);
    } else {
      return false;
    }
  }

  public areAllTasksCompleted(): boolean {
    return this.workorder.tasks.every((t) => t.report?.dateCompletion);
  }

  private initFeatureSelectionListeners() {
    this.mapEventService
      .onFeatureSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (feature) => {
        // Multiselection
        if (this.inMultiSelectionEditMode) {
          this.loading = true;
          await this.addNewFeatures(feature);
          this.loading = false;
        }
        // Asset selection
        else if (this.inAssetEditMode) {
          // We do not want to be able to change the type of asset, or else we can change an AEP to ASS
          // or a Line to Point thus breaking every rules made before
          if (
            !this.editTaskEquipment.assObjTable.includes('_xy') &&
            this.editTaskEquipment.assObjTable !== feature.layerKey
          ) {
            return;
          }
          this.editTaskEquipment.assObjRef = feature.featureId;
          this.editTaskEquipment.assObjTable = feature.layerKey;
          const asset = await this.layerService.getEquipmentByLayerAndId(
            this.editTaskEquipment.assObjTable,
            (this.editTaskEquipment.assObjRef = feature.featureId)
          );
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
        this.onSaveWorkOrderState.emit(this.workorder);
      });

    this.mapEventService
      .onMultiFeaturesSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (features) => {
        if (this.inMultiSelectionEditMode) {
          this.loading = true;
          await this.addNewFeatures(features);
          this.loading = false;
        }
      });
  }

  /**
   * Method to display and zoom to the workorder equipment
   * @param workorder the workorder
   */
  private async displayAndZoomToPlannedWko(workorder: Workorder) {
    const geometries = [];
    this.route.queryParams.subscribe((params) => {
      let x = this.workorder.longitude;
      let y = this.workorder.latitude;

      if (params['state'] && params['state'] == 'resume') {
        x = this.mapService.getMap().getCenter().lng;
        y = this.mapService.getMap().getCenter().lat;
      }

      this.maplayerService.moveToXY(x, y).then(() => {
        //Case display layers in params
        if (params['layers']) {
          const layers: string[] = params['layers'].split(',');
          for (let layer of layers) {
            this.mapService.addEventLayer(layer);
          }
        }

        this.mapService.addEventLayer('task').then(() => {
          for (let task of workorder.tasks) {
            this.mapService.addEventLayer(task.assObjTable).then(async () => {
              if (!task.assObjRef && !task.assObjTable.includes('_xy')) {
                task.assObjTable = 'aep_xy';
                this.onEditEquipment(task);
              }

              this.mapService.addGeojsonToLayer(this.workorder, 'task');
              setTimeout(() => {
                let feature: any = this.maplayerService.getFeatureById(
                  'task',
                  task.id + ''
                );
                if (feature) {
                  feature.geometry.coordinates = [
                    task.longitude,
                    task.latitude,
                  ];
                  this.mapService.updateFeatureGeometry('task', feature);
                  geometries.push(feature.geometry.coordinates);

                  if (!params['state'] || params['state'] != 'resume') {
                    this.maplayerService.fitBounds(geometries, 21);
                  }
                }
              }, 500);
              this.mapEventService.highlighSelectedFeatures(
                this.mapService.getMap(),
                undefined
              );
            });
          }
        });
      });
    });
  }

  private stopAssetEditMode() {
    if (!this.inMultiSelectionEditMode) {
      this.removeSelectionMessage();
    }

    this.inAssetEditMode = false;
    this.onSaveWorkOrderState.emit(this.workorder);
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
    this.onSaveWorkOrderState.emit(this.workorder);
  }

  private async showSelectionMessage() {
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }

    this.currentSelectionMessage = await this.toastController.create({
      message: 'Sélectionner patrimoine sur la carte',
      position: 'top',
      color: 'light',
    });
    await this.currentSelectionMessage.present();
  }

  private async removeSelectionMessage() {
    if (this.currentSelectionMessage) {
      this.currentSelectionMessage.remove();
    }
  }

  private async addNewFeatures(features: any | any[]): Promise<void> {
    // The pin of each report/task is taken by the selection, so we need to remove them
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }

    if (!Array.isArray(features) && Number.isNaN(Number(features.id))) {
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
      features = features
        .filter((f) => Number.isNaN(Number(f.id)))
        .map((f) => {
          return {
            ...this.maplayerService.getFeatureById(f.source, f.id)[
              'properties'
            ],
            lyrTableName: f.source,
          };
        });
    }

    features = await this.checkAssets(features);

    if (!features || features?.length === 0) {
      return;
    }

    const lStatus = await this.workorderService.getAllWorkorderTaskStatus();
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }
    // When editing the asset of a workorder
    // If the workorder has tasks on XY then remove them from the list
    this.workorder.tasks
      .filter((t) => t.assObjTable.includes('xy'))
      .forEach((t) => this.mapService.removePoint('task', t.id.toString()));

    this.workorder.tasks = this.workorder.tasks.filter(
      (t) => !t.assObjTable.includes('_xy')
    );

    this.selectedTasks = [];
    this.currentTasksSelected = [];
    this.onSelectedTaskChange.emit([]);

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
      }
    }

    this.checkWtrIdPossible(features);

    this.workorder.longitude = this.workorder.tasks[0].longitude;
    this.workorder.latitude = this.workorder.tasks[0].latitude;
    if (
      this.editTaskEquipment?.assObjTable.includes('_xy') &&
      this.draggableMarker?.isDraggable()
    ) {
      this.draggableMarker.remove();
    }

    if (!this.editTaskEquipment) {
      this.inAssetEditMode = false;
    }

    this.stopMultiSelectionEditMode();
    this.workorder.tasks.forEach((t) => t.isSelectedTask = false);
    this.onSaveWorkOrderState.emit(this.workorder);
  }

  private async transformTasksToAsset(features: any[]): Promise<any[]> {
    let featuresToMap = this.workorder.tasks?.filter(
      (t) => !features.map((f) => f.id).includes(t.assObjTable)
    );

    featuresToMap = [
      ...featuresToMap,
      ...features.map((f) => {
        return { assObjTable: f.lyrTableName, assObjRef: f.id };
      }),
    ];
    const assets = await this.layerService.getEquipmentsByLayersAndIds(
      this.utils.transformArrayForAssets(featuresToMap)
    );

    return assets;
  }

  private async checkAssets(assets: any[]): Promise<any[]> {
    const layers = await this.layerService.getAllLayers();

    assets = await this.transformTasksToAsset(assets);

    if (
      this.workorder.tasks?.length === 1 &&
      this.workorder.tasks[0].assObjTable.includes('xy')
    ) {
      const domain =
        this.workorder.tasks[0].assObjTable.split('_')[0] === 'aep'
          ? 'dw'
          : 'ww';
      const selectedLayers = layers.filter(
        (l) =>
          assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName) &&
          l.domCode === domain
      );

      if (selectedLayers.length === 0) {
        await this.utils.showErrorMessage(
          `Il n'y a pas d'équipements compatible avec le domaine ${
            domain === 'dw' ? 'Eau Potable' : 'Assainissement'
          } dans la sélection.`
        );
        assets = [];
      } else if (selectedLayers.length > 1) {
        const modal = await this.modalCtrl.create({
          component: MonoXyRulesModalComponent,
          componentProps: {
            assets,
            selectedLayers,
            domain:
              this.workorder.tasks[0].assObjTable.split('_')[0] === 'aep'
                ? 'dw'
                : 'ww',
          },
          backdropDismiss: false,
        });

        modal.present();

        const { data } = await modal.onWillDismiss();

        assets = data;
      }
    } else {
      // Checking if we have a mix of dw/ww assets
      const isMultiWater =
        [
          // Removing duplicates
          ...new Set(
            // Finding the differents dom codes for the current layers
            layers
              .filter((l: Layer) => {
                if (
                  assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .map((l) => l.domCode)
          ),
        ].length === 2;

      // Checking if the assets are on more than one contract
      const isMultiContract =
        [...new Set(assets.map((ast) => ast.ctrId))].length > 1;

      // Checking if there is a difference between assets GEOMs
      const isMultiGeomType =
        [
          ...new Set(
            layers
              .filter((l: Layer) =>
                assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
              )
              .map((l) => l.lyrGeomType)
          ),
        ].length > 1;

      assets = this.utils
        .removeDuplicatesFromArr([...assets], 'id')
        .filter((feature) => feature.lyrTableName !== 'task');

      if (isMultiGeomType || isMultiWater || isMultiContract) {
        const originalGeomType = layers.find(
          (l) => l.lyrTableName === this.workorder.tasks[0].assObjTable
        ).lyrGeomType;

        const modal = await this.modalCtrl.create({
          component: MultiAssetsModalComponent,
          componentProps: {
            isMultiGeomType,
            isMultiWater,
            isMultiContract,
            assets,
            originalGeomType,
          },
          backdropDismiss: false,
        });
        modal.present();

        const { data } = await modal.onWillDismiss();

        if (data) {
          assets = data;
        }
      }
    }

    return assets;
  }

  private async checkWtrIdPossible(assets: any[]): Promise<void> {
    const lyrTableNames = [...new Set(assets.map((ast) => ast.lyrTableName))];
    const wtrPossibles = [];
    const layerGrpActions = await this.layerService.getAllLayerGrpActions();

    if (lyrTableNames.length > 0 && layerGrpActions && layerGrpActions.length > 0) {
      for (const lyrGrpAct of layerGrpActions) {
        if (
          lyrTableNames.every((ltn) => lyrGrpAct.lyrTableNames.includes(ltn))
        ) {
          wtrPossibles.push(lyrGrpAct.wtrCode);
        }
      }
      if (wtrPossibles.length === 1) {
        const wtrs = await this.layerService.getAllVLayerWtr();
        this.workorder.tasks.forEach(
          (t) =>
            (t.wtrId =
              wtrs.find((wtr) => wtr.wtrCode === wtrPossibles[0])?.wtrId ??
              null)
        );
      }
    }
  }
}
