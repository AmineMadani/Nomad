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
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import * as Maplibregl from 'maplibre-gl';
import { IonPopover, ModalController, ToastController } from '@ionic/angular';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MultiAssetsModalComponent } from '../../../../multi-assets-modal/multi-assets-modal.component';

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
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();
  @Output() onClosedWko: EventEmitter<boolean> = new EventEmitter();
  @Output() goToDateStep: EventEmitter<void> = new EventEmitter();

  public currentTasksSelected: Task[];
  public editTaskAsset: Task;
  public draggableMarker: Maplibregl.Marker;
  public currentSelectionMessage: any;
  public inAssetEditMode: boolean = false;
  public inMultiSelectionEditMode: boolean = false;
  public loading: boolean = false;

  private refLayers: Layer[];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private oldAsset: any;
  private nbItemsPerPage: number = 20;
  private nbDisplayedTask: number = 20;

  ngOnInit() {
    this.mapService.onMapLoaded('home').subscribe(() => {
      if (this.workorder && this.workorder.tasks?.length > 1) {
        this.currentTasksSelected = [];
        for (const task of this.workorder.tasks.filter((tsk) => !tsk.isSelectedTask)) {
          this.onSelectTask(task);
        }
      }
      this.displayAndZoomToPlannedWko(this.workorder);

      this.initFeatureSelectionListeners();
    });

    this.layerService.getAllLayers().then((layers: Layer[]) => {
      this.refLayers = layers;
    });

    this.currentTasksSelected = this.selectedTasks;

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
    } else {
      this.currentTasksSelected.push(task);
      task.isSelectedTask = true;
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
    this.onSaveWorkOrderState.emit();
    this.drawerService.navigateTo(DrawerRouteEnum.NEW_ASSET, [], {
      draft: this.workorder.id,
      step: 'report',
    });
  }

  /**
   * Edit asset
   * @param tsk  Task asset to edit
   */
  public onEditAsset(tsk: Task) {
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
        .getAssetByLayerAndId(tsk.assObjTable, tsk.assObjRef)
        .then(async (result) => {
          this.draggableMarker = this.maplayerService.addMarker(
            'home',
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
        'home',
        tsk.longitude,
        tsk.latitude,
        [tsk.longitude as any, tsk.latitude as any],
        true,
        'green'
      );
    }
    this.mapEventService.isFeatureFiredEvent = true;
    this.editTaskAsset = tsk;
    this.oldAsset = {
      featureId: tsk.assObjRef,
      layerKey: tsk.assObjTable,
      x: tsk.longitude,
      y: tsk.latitude,
    };
  }

  /**
   * Validate the asset change
   * @param tsk the task to update
   */
  public onValidateChangeAsset(t?: Task) {
    // If we are in asset modification
    if (this.inAssetEditMode) {
      const tsk = t ? t : this.editTaskAsset;

      let feature: any = this.maplayerService.getFeatureById(
        'home',
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

      this.mapService.updateFeatureGeometry('home', 'task', feature);
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
      this.editTaskAsset = null;

      const taskOnTheSameAssetIndex = this.workorder.tasks.findIndex(
        (t) => t.assObjRef === tsk.assObjRef && t.id !== tsk.id
      );
      if (taskOnTheSameAssetIndex > -1) {
        this.mapService.removePoint(
          'home',
          'task',
          this.workorder.tasks[taskOnTheSameAssetIndex].id.toString()
        );
        this.workorder.tasks.splice(taskOnTheSameAssetIndex, 1);
      }
      this.onSaveWorkOrderState.emit();

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
    this.mapService.removePoint('home', 'task', tsk.id.toString());
  }

  /**
   * Remove the asset change
   * @param tsk task change to remove
   */
  public onRemoveChangeAsset(t?: Task) {
    if (this.inAssetEditMode) {
      const tsk = t ?? this.workorder.tasks[0];

      if (!tsk.assObjTable.includes('_xy')) {
        this.mapService
          .getMap('home')
          .setFeatureState(
            { source: tsk.assObjTable, id: tsk.assObjRef },
            { selected: false }
          );
      }
      tsk.assObjRef = this.oldAsset.featureId;
      tsk.assObjTable = this.oldAsset.layerKey;
      this.mapEventService.isFeatureFiredEvent = false;
      this.editTaskAsset = null;
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
      this.mapEventService.highlightHoveredFeatures(
        this.mapService.getMap('home'),
        [
          { id: task.id.toString(), source: 'task' },
          { id: task.assObjRef, source: task.assObjTable },
        ]
      );
    }
  }

  /**
   * Method to unhighligh feature when leave hover
   * @param task
   */
  public onItemHoverLeave(task: Task) {
    this.mapEventService.highlightHoveredFeatures(
      this.mapService.getMap('home'),
      []
    );
  }

  /**
   * Check terminated report
   * @returns True if a task has a terminated report
   */
  public hasReportClosed() {
    return (
      this.workorder.tasks &&
      this.workorder.tasks.some((tsk) => tsk.report?.dateCompletion)
    );
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
    this.onEditAsset(this.workorder.tasks[0]);
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
    this.onRemoveChangeAsset();
    this.stopAssetEditMode();
  }

  public onAllSelectedChange() {
    if (this.isAllElementSelected) {
      // Unselect all task
      for (const task of this.workorder.tasks.filter(
        (tsk) => tsk.isSelectedTask && !tsk.report?.dateCompletion
      )) {
        this.onSelectTask(task);
      }
    } else {
      this.workorder.tasks
        .filter((tsk) => !tsk.isSelectedTask)
        .forEach((tsk) => this.onSelectTask(tsk));
    }
  }

  public get isAllElementSelected() {
    const tasks = this.workorder.tasks;
    if (tasks?.length > 0) {
      return tasks.every((tsk) => tsk.isSelectedTask);
    } else {
      return false;
    }
  }

  public get areAllTasksCompleted(): boolean {
    return this.workorder.tasks.every((t) => t.report?.dateCompletion);
  }

  public get areSomeElementsChecked(): boolean {
    return (
      this.workorder.tasks.some((t) => t.isSelectedTask) &&
      !this.isAllElementSelected
    );
  }

  public getDisplayedTasks(): Task[] {
    return this.workorder.tasks.slice(0, this.nbDisplayedTask);
  }

  public onScroll(event: any): void {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      // User has scrolled to the bottom of the element
      this.nbDisplayedTask += this.nbItemsPerPage;
    }
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
            !this.editTaskAsset.assObjTable.includes('_xy') &&
            this.editTaskAsset.assObjTable !== feature.layerKey &&
            this.workorder.tasks.length > 1
          ) {
            return;
          }
          this.editTaskAsset.assObjRef = feature.featureId;
          this.editTaskAsset.assObjTable = feature.layerKey;
          const asset = await this.layerService.getAssetByLayerAndId(
            this.editTaskAsset.assObjTable,
            (this.editTaskAsset.assObjRef = feature.featureId)
          );
          this.editTaskAsset.ctrId = asset.ctrId;
          this.workorder.ctrId = asset.ctrId.toString();
          this.workorder.ctyId = asset.ctyId.toString();
          if (this.draggableMarker) {
            this.draggableMarker.remove();
            this.draggableMarker = null;
          }
          this.draggableMarker = this.maplayerService.addMarker(
            'home',
            feature.x ? feature.x : this.editTaskAsset.longitude,
            feature.y ? feature.y : this.editTaskAsset.latitude,
            asset.geom.coordinates,
            false,
            'green'
          );
        }
        this.onSaveWorkOrderState.emit();
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
   * Method to display and zoom to the workorder asset
   * @param workorder the workorder
  * It seems to be slow as fck here
   */
  private async displayAndZoomToPlannedWko(workorder: Workorder) {
    const geometries = [];
    this.route.queryParams.subscribe(async (params) => {
      await this.moveToWorkorder(params);

      //Case display layers in params
      if (params['layers']) {
        const layers: string[] = params['layers'].split(',');
        for (const layer of layers) {
          await this.mapService.addEventLayer('home', layer);
        }
      }

      await this.mapService.addGeojsonToLayer(
        'home',
        this.workorder,
        'task'
      );

      for (const task of workorder.tasks) {
        if (!this.mapService.hasEventLayer(task.assObjTable)) {
          await this.mapService.addEventLayer('home', task.assObjTable);
        }

        if (!task.assObjRef && !task.assObjTable.includes('_xy')) {
          task.assObjTable = 'aep_xy';
          this.onEditAsset(task);
        }

        const feature: any = this.maplayerService.getFeatureById(
          'home',
          'task',
          task.id.toString()
        );
        if (feature) {
          feature.geometry.coordinates = [
            task.longitude,
            task.latitude,
          ];
          this.mapService.updateFeatureGeometry(
            'home',
            'task',
            feature
          );
          geometries.push(feature.geometry.coordinates);
        }
      }

      this.mapEventService.highlighSelectedFeatures(
        this.mapService.getMap('home'),
        undefined
      );

      if ((!params['state'] || params['state'] != 'resume') && geometries.length > 0) {
        this.maplayerService.fitBounds('home', geometries, 21);
      }
    });
  }

  private async moveToWorkorder(params) {
    let x = this.workorder.longitude;
    let y = this.workorder.latitude;

    if (this.workorder.tasks && this.workorder.tasks.length == 1) {
      x = this.workorder.tasks[0].longitude;
      y = this.workorder.tasks[0].latitude;
    }

    if (params['state'] && params['state'] == 'resume') {
      x = this.mapService.getMap('home').getCenter().lng;
      y = this.mapService.getMap('home').getCenter().lat;
    }

    await this.maplayerService.moveToXY('home', x, y);
  }

  private stopAssetEditMode() {
    if (!this.inMultiSelectionEditMode) {
      this.removeSelectionMessage();
    }

    this.inAssetEditMode = false;
    this.onSaveWorkOrderState.emit();
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
      color: 'light',
      cssClass: this.utils.isMobilePlateform() ? 'toast-mobile' : '',
    });
    await this.currentSelectionMessage.present();
  }

  private async removeSelectionMessage() {
    if (this.currentSelectionMessage) {
      this.currentSelectionMessage.remove();
    }
  }

  private async addNewFeatures(features: any | any[]): Promise<void> {
    this.onValidateChangeAsset();

    // The pin of each report/task is taken by the selection, so we need to remove them
    if (this.currentSelectionMessage) {
      this.removeSelectionMessage();
    }

    /**
     * isNaN is to avoid having a tasks in the selection, as the id is a number whereas assets have a string
     * The feature.id is because if the comment above is true, clusters of tasks does not have a number id
     * but an undefined id, which is indeed NaN...
     */
    if (
      !Array.isArray(features) &&
      Number.isNaN(Number(features.id)) &&
      features.featureId
    ) {
      features = [
        {
          ...this.maplayerService.getFeatureById(
            'home',
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
            ...this.maplayerService.getFeatureById('home', f.source, f.id)[
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
      .filter(
        (t) =>
          t.assObjTable.includes('xy') ||
          !features.map((f) => f.lyrTableName).includes(t.assObjTable)
      )
      .forEach((t) =>
        this.mapService.removePoint('home', 'task', t.id.toString())
      );

    this.workorder.tasks = this.workorder.tasks.filter(
      (t) =>
        !t.assObjTable.includes('_xy') &&
        features.map((f) => f.lyrTableName).includes(t.assObjTable)
    );

    this.selectedTasks = [];
    this.currentTasksSelected = [];
    this.onSelectedTaskChange.emit([]);

    const tasks: Task[] = [];
    for (let f of features) {
      if (!this.workorder.tasks.find((t) => t.assObjRef === f.id)) {
        const asset = await this.layerService.getAssetByLayerAndId(
          f.lyrTableName,
          f.id
        );

        const task = {
          id: this.utils.createCacheId(),
          assObjTable: f.lyrTableName,
          assObjRef: f.id,
          latitude: f.y,
          longitude: f.x,
          wtrId: this.workorder.tasks[0]?.wtrId ?? null,
          wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
          ctrId: asset.ctrId,
        };

        tasks.push(task);
      }
    }

    this.workorder.tasks = [...this.workorder.tasks, ...tasks];

    // this.checkWtrIdPossible(features);

    this.workorder.longitude = this.workorder.tasks[0].longitude;
    this.workorder.latitude = this.workorder.tasks[0].latitude;

    this.stopMultiSelectionEditMode();
    this.workorder.tasks.forEach((t) => (t.isSelectedTask = false));
    this.onSaveWorkOrderState.emit();
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
    const assets = await this.layerService.getAssetsByLayersAndIds(
      this.utils.transformArrayForAssets(featuresToMap)
    );

    return assets;
  }

  private async checkAssets(assets: any[]): Promise<any[]> {
    const layers = await this.layerService.getAllLayers();

    assets = await this.transformTasksToAsset(assets);

    let selectedLayers = layers.filter((l) =>
      assets.map((ast) => ast.lyrTableName).includes(l.lyrTableName)
    );

    // Domain is needed only with XY as the user already choose between AEP/ASS
    let domain: string,
      isMultiWater: boolean = null;
    if (this.workorder.tasks?.[0].assObjTable.includes('_xy')) {
      domain =
        this.workorder.tasks[0].assObjTable.split('_')[0] === 'aep'
          ? 'dw'
          : 'ww';

      selectedLayers = selectedLayers.filter((l) => l.domCode === domain);

      assets = assets.filter((ast) =>
        selectedLayers.map((l) => l.lyrTableName).includes(ast.lyrTableName)
      );
      // If not XY, need to check if it's assets from multi water
    } else {
      isMultiWater =
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
    }

    // Checking if the assets are on more than one contract
    const isMultiContract =
      [...new Set(assets.map((ast) => ast.ctrId))].length > 1;

    if (selectedLayers.length === 0) {
      await this.utils.showErrorMessage(
        `Il n'y a pas d'équipements compatible avec le domaine ${
          domain === 'dw' ? 'Eau Potable' : 'Assainissement'
        } dans la sélection.`
      );
      assets = [];
    } else if (selectedLayers.length > 1 || isMultiContract) {
      const modal = await this.modalCtrl.create({
        component: MultiAssetsModalComponent,
        componentProps: {
          assets,
          selectedLayers,
          isMultiWater,
          isMultiContract,
          domain,
        },
        backdropDismiss: false,
      });

      modal.present();

      const { data } = await modal.onWillDismiss();

      assets = data;
    }

    return assets;
  }

  private async checkWtrIdPossible(assets: any[]): Promise<void> {
    const lyrTableNames = [...new Set(assets.map((ast) => ast.lyrTableName))];
    const wtrPossibles = [];
    const layerGrpActions = await this.layerService.getAllLayerGrpActions();

    if (
      lyrTableNames.length > 0 &&
      layerGrpActions &&
      layerGrpActions.length > 0
    ) {
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
