import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Subject, takeUntil, filter, switchMap, EMPTY, debounceTime } from 'rxjs';
import { Layer, SearchEquipments } from 'src/app/core/models/layer.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { IonPopover } from '@ionic/angular';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Workorder } from 'src/app/core/models/workorder.model';
import { DrawingService } from 'src/app/core/services/map/drawing.service';

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.drawer.html',
  styleUrls: ['./multiple-selection.drawer.scss'],
})
export class MultipleSelectionDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private layerService: LayerService,
    private mapService: MapService,
    private mapLayerService: MapLayerService,
    private drawerService: DrawerService,
    private mapEventService: MapEventService,
    private utilsService: UtilsService,
    private userService: UserService,
    private workorderService: WorkorderService,
    private drawingService: DrawingService,
  ) {
    // Params does not trigger a refresh on the component, when using polygon tool, the component need to be refreshed manually
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        switchMap(() => {
          // if (this.updateUrl) {
          //   this.updateUrl = false;
          //   return EMPTY;
          // }
          const urlParams = new URLSearchParams(window.location.search);
          this.paramFeatures = this.utilsService.transformMap(
            new Map(urlParams.entries())
          );
          return this.layerService.getEquipmentsByLayersAndIds(
            this.paramFeatures
          );
        }),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe((features: any[]) => {
        this.featuresSelected = [];
        this.filteredFeatures = [];
        this.sources = [];
        this.layersConf = [];
        this.featuresHighlighted = [];
        this.mapLayerService.fitBounds(
          features.map((f) => {
            return [+f.x, +f.y];
          })
        );

        const equipments = features.map((f) => {
          return {
            ...f,
            lyrTableName: this.paramFeatures.find((map) =>
              map.equipmentIds.includes(f.id)
            ).lyrTableName,
          };
        });

        this.onInitSelection(equipments);
      });

    this.mapEventService
      .onFeatureHovered()
      .pipe(debounceTime(300), takeUntil(this.ngUnsubscribe$))
      .subscribe((f: string) => {
        if (f) {
          this.featureIdSelected = f;
          const name = 'feature-container-' + this.featureIdSelected;
          document.getElementById(name)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          this.featureIdSelected = undefined;
        }
      });

    this.mapEventService
      .onFeatureSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (feature) => {
        await this.addNewFeatures(feature);
      });

    this.mapEventService
      .onMultiFeaturesSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (features) => {
        await this.addNewFeatures(features);
      });
  }

  @ViewChild('popover', { static: true }) popover: IonPopover;

  public buttons: SynthesisButton[] = [];

  public featuresSelected: any[] = [];
  public filteredFeatures: any[] = [];
  public sources: { key: string; label: string }[] = [];
  public selectedSource: any;
  public isLoading: boolean = false;
  public isMobile: boolean;
  public addToSelection: boolean = false;
  public updateUrl: boolean = false;
  public wkoDraft: number;
  public featureIdSelected: string = '';
  public featuresHighlighted: any[] = [];
  public userHasPermissionCreateAssetWorkorder: boolean = false;
  public userHasPermissionRequestUpdateAsset: boolean = false;

  private layersConf: Layer[] = [];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private paramFeatures: any;
  private step: string;

  async ngOnInit() {
    this.wkoDraft = this.activatedRoute.snapshot.queryParams?.['draft'];
    this.step = this.activatedRoute.snapshot.queryParams?.['step'];
    this.buttons = [
      { key: 'add', label: 'Ajouter un élement', icon: 'add' },
      {
        key: 'create',
        label: this.wkoDraft
          ? (this.step == 'report' ? "Reprendre le CR" : "Reprendre l'intervention")
          : 'Générer une intervention',
        icon: 'person-circle',
        disabledFunction: () => !this.userHasPermissionCreateAssetWorkorder,
      },
      {
        key: 'new-asset',
        label: 'Créer un patrimoine',
        icon: 'refresh',
        disabledFunction: () => !this.userHasPermissionRequestUpdateAsset,
      },
      {
        key: 'showSelectedFeatures',
        label: 'Afficher toutes les sélections',
        icon: 'locate',
      },
    ];
    this.isMobile = this.utilsService.isMobilePlateform();

    // Permissions
    this.userHasPermissionCreateAssetWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_ASSET_WORKORDER);
    this.userHasPermissionRequestUpdateAsset =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.REQUEST_UPDATE_ASSET);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public trackByFn(index: number, feature: any): number {
    return feature.id;
  }

  public async onInitSelection(paramsMap: any): Promise<void> {
    this.isLoading = true;
    await this.addLayerToMap(paramsMap);
  }

  public async addLayerToMap(abstractFeatures: any[]): Promise<void> {
    if (this.wkoDraft != null) {
      // Add tempory new asset
      const wko: Workorder = await this.workorderService.getWorkorderById(this.wkoDraft);
      const listTaskOnNewAsset = wko.tasks.filter((task) => task.assObjRef?.startsWith('TMP-'));
      for (const task of listTaskOnNewAsset) {
        abstractFeatures.push(
          {
            id: task.assObjRef,
            lyrTableName: task.assObjTable,
            x: task.longitude,
            y: task.latitude,
            isTemp: true,
          }
        );
      }
    }

    const promises: Promise<void>[] = abstractFeatures.map(
      ({ lyrTableName }) => {
        return this.mapService.addEventLayer(lyrTableName);
      }
    );

    await Promise.all(promises);


    this.sources = [
      ...new Set(abstractFeatures.map(({ lyrTableName }) => lyrTableName)),
    ].map((lyrName: string) => {
      const conf = this.mapService.getLayer(lyrName).configurations;
      this.layersConf.push(conf);
      return { key: lyrName, label: conf.lyrSlabel };
    });

    let mapSearch:Map<string, string[]> = new Map();
    for (let feature of abstractFeatures) {
      if (feature.isTemp) {
        this.featuresSelected.push(feature);
      } else {
        if(mapSearch.get(feature.lyrTableName)) {
          mapSearch.get(feature.lyrTableName).push(feature.id);
        } else {
          mapSearch.set(feature.lyrTableName, [feature.id]);
        }
      }
    }
   
    let searchEquipments: SearchEquipments[] = [];
    for(let [key,value] of mapSearch){
      searchEquipments.push({
        lyrTableName: key,
        equipmentIds: value
      })
    }

    const searchEquipmentsRes = await this.layerService.getEquipmentsByLayersAndIds(searchEquipments);
    this.featuresSelected = this.utilsService.removeDuplicatesFromArr([...this.featuresSelected, ...searchEquipmentsRes], 'id');
    this.filteredFeatures = this.featuresSelected;

    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.featuresSelected
      .filter((f) => f.isTemp !== true)
      .map((f: any) => {
        return { id: f.id, source: f.lyrTableName };
      })
    );

    this.mapLayerService.fitBounds(
      this.featuresSelected.map((f) => {
        return [+f.x, +f.y];
      })
    );

    // this.addToSelection = false;
    this.isLoading = false;
  }

  public onTabButtonClicked(e: SynthesisButton): void {
    switch (e.key) {
      case 'add':
        this.popover.present();
        break;
      case 'create':
        if (this.wkoDraft){
          if(this.step == 'report') {
            this.drawerService.navigateTo(
              DrawerRouteEnum.REPORT,
              [this.wkoDraft]
            );
          } else {
            this.drawerService.navigateTo(
              DrawerRouteEnum.WORKORDER_EDITION,
              [ this.wkoDraft ],
            );
          }
        }
        else{
          this.drawerService.navigateWithEquipments(
            DrawerRouteEnum.WORKORDER_CREATION,
            this.featuresSelected,
          );
        }

        break;
      case 'new-asset':
        if (this.wkoDraft) {
          this.drawerService.navigateTo(
            DrawerRouteEnum.NEW_ASSET,
            [],
            { 
              draft: this.wkoDraft, 
            }
          );
        } else {
          this.drawerService.navigateTo(
            DrawerRouteEnum.NEW_ASSET,
            [],
          );
        }
        break;
      case 'showSelectedFeatures':
        this.restoreViewOnFeatureSelected();
        break;
      default:
        break;
    }
  }

  public setAddMode(mode: string): void {
    this.mapEventService.isFeatureFiredEvent = true;
    switch (mode) {
      case 'polygon':
        this.drawingService.setDrawMode('draw_polygon');
        break;
      case 'rect':
        this.drawingService.setDrawMode('draw_rectangle');
        break;
      case 'unit':
        // this.mapService.setAddToSelection(true);
        break;
    }
    this.popover.dismiss();
  }

  public handleChange(e: Event): void {
    const event: CustomEvent = e as CustomEvent;
    if (event?.detail.value?.length > 0) {
      this.filteredFeatures = this.featuresSelected.filter((f) =>
        event.detail.value.includes(f.lyrTableName)
      );
    } else {
      this.selectedSource = undefined;
      this.filteredFeatures = this.featuresSelected;
    }
  }

  public openFeature(feature: any): void {
    if (feature.isTemp === true) return;

    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [feature.id], {
      lyrTableName: feature.lyrTableName,
    });
  }

  public async removeFeature(e: Event, feature: any): Promise<void> {
    e.stopPropagation();

    if (this.featuresHighlighted.includes(feature)) {
      this.featuresHighlighted.splice(
        this.featuresHighlighted.findIndex((f) => f.id === feature.id),
        1
      );
    }

    this.featuresSelected.splice(
      this.featuresSelected.findIndex((f) => f.id === feature.id),
      1
    );

    if (this.filteredFeatures.includes(feature)) {
      this.filteredFeatures.splice(
        this.featuresSelected.findIndex((f) => f.id === feature.id),
        1
      );
    }

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(this.wkoDraft);
      wko.tasks = wko.tasks.filter((t) => t.assObjRef !== feature.id);
      await this.workorderService.saveCacheWorkorder(wko);
    }

    this.mapEventService.removeFeatureFromSelected(
      this.mapService.getMap(),
      feature.id
    );
  }

  public getLyrLabel(layerKey: string): string {
    return this.layersConf.find((l: Layer) => l.lyrTableName.includes(layerKey))
      .lyrSlabel;
  }

  public getDomLabel(layerKey: string): string {
    return this.layersConf.find((l: Layer) => l.lyrTableName.includes(layerKey))
      .domLLabel;
  }

  public generateFeatureParams(features: any[]): any {
    const featureParams: any = {};

    features.forEach((feature) => {
      const source = feature.lyrTableName || feature.source;

      if (!featureParams[source]) {
        featureParams[source] = new Set();
      }

      featureParams[source].add(feature.id);
    });

    // Convert the Sets to comma-separated strings
    Object.keys(featureParams).forEach((source) => {
      featureParams[source] = Array.from(featureParams[source]).join(',');
    });

    return featureParams;
  }

  public bounceToFeature(e: Event, feature: any) {
    e.stopPropagation();

    if (this.featuresHighlighted.includes(feature)) {
      this.featuresHighlighted = [];
      this.restoreViewOnFeatureSelected();
      this.hightlightFeatures();
    } else {
      this.featuresHighlighted.push(feature);
      this.hightlightFeatures(this.featuresHighlighted);
      this.mapLayerService.fitBounds(
        this.featuresHighlighted.map((f) => {
          return [+f.x, +f.y];
        })
      );
    }
  }

  public restoreViewOnFeatureSelected() {
    this.featuresHighlighted = [];
    this.hightlightFeatures();
    this.mapLayerService.fitBounds(
      this.featuresSelected.map((f) => {
        return [+f.x, +f.y];
      })
    );
  }

  public highlightSelectedFeature(feature: any): void {
    if (feature) {
      const features = this.featuresHighlighted.length > 0 ? [feature, ...this.featuresHighlighted] : [feature];
      this.hightlightFeatures(features);
    } else {
      if (this.featuresHighlighted.length > 0) {
        this.hightlightFeatures(this.featuresHighlighted);
      } else {
        this.hightlightFeatures();
      }
    }
  }

  private hightlightFeatures(features?: any[]): void {
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      (features ?? this.featuresSelected).map((f: any) => {
        return { id: f.id, source: f.lyrTableName };
      })
    );
  }

  private async addNewFeatures(features: any | any[]): Promise<void> {
    if (!Array.isArray(features)) {
      features = [{ ...this.mapLayerService.getFeatureById(features.layerKey, features.featureId)['properties'], lyrTableName: features.layerKey }];
    } else {
      features = features.map((f) => {
        return { ...this.mapLayerService.getFeatureById(f.source, f.id)['properties'], lyrTableName: f.source}
      })
    }


    features = this.utilsService.removeDuplicatesFromArr([...this.featuresSelected, ...features], 'id');

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(this.wkoDraft);
      this.workorderService.getAllWorkorderTaskStatus().subscribe(async lStatus => {
        for (let f of features) {
          if (!wko.tasks.find((t) => t.assObjRef === f.id)) {
            wko.tasks.push({
              id: this.utilsService.createCacheId(),
              assObjTable: f.lyrTableName,
              assObjRef: f.id,
              latitude: f.y,
              longitude: f.x,
              wtrId: wko.tasks[0]?.wtrId ?? null,
              wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id
            })
          }
        }
        await this.workorderService.saveCacheWorkorder(wko);
      });
    }

    const qParam = this.wkoDraft ? { draft: this.wkoDraft } : {};
    this.drawerService.navigateWithEquipments(DrawerRouteEnum.SELECTION, features, qParam);
  }
}
