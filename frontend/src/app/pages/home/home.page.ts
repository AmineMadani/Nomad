import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from '../../shared/components/map/map.component';
import {
  Subject,
  debounceTime,
  filter,
  fromEvent,
  take,
  takeUntil,
} from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { IonModal, ModalController, createAnimation } from '@ionic/angular';
import {
  DrawerRouteEnum,
  DrawerTypeEnum,
} from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { MobileHomeActionsComponent } from './components/mobile-home-actions/mobile-home-actions.component';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import * as Maplibregl from 'maplibre-gl';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    public drawerService: DrawerService,
    private layerService: LayerService,
    private modalCtrl: ModalController,
    private mapService: MapService,
    public drawingService: DrawingService,
    public route: Router,
    public userService: UserService,
    private mapLayerService: MapLayerService,
    private mapEventService: MapEventService
  ) {
    this.drawerService.initDrawerListener();
    this.mapService
      .onMapLoaded()
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe(() => {
        this.addHomeMapEvents();
        this.interactiveMap.setMeasure(undefined);
      });
  }

  animationBuilder = (baseEl: any, opts?: any) => {
    const enteringAnimation = createAnimation()
      .addElement(opts.enteringEl)
      .fromTo('opacity', 0, 1)
      .duration(250);

    const leavingAnimation = createAnimation()
      .addElement(opts.leavingEl)
      .fromTo('opacity', 1, 0)
      .duration(250);

    const animation = createAnimation()
      .addAnimation(enteringAnimation)
      .addAnimation(leavingAnimation);

    return animation;
  };

  @ViewChild('interactiveMap') interactiveMap: MapComponent;
  @ViewChild('modalDataLoading') modal: IonModal;
  @ViewChild('modal') drawerModal: IonModal;

  public drawerRouteEnum = DrawerRouteEnum;
  public drawerTypeEnum = DrawerTypeEnum;
  public drawerHasBeenOpened: boolean = false;
  public currentRoute: DrawerRouteEnum = DrawerRouteEnum.HOME;
  public drawerType: DrawerTypeEnum = DrawerTypeEnum.DRAWER;

  public isMobile: boolean;

  private preventTouchMoveClicked: boolean = false;
  private drawerUnsubscribe$: Subject<void> = new Subject();

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    this.initDrawer();
  }

  ngOnDestroy(): void {
    this.destroyDrawer();
    this.mapService.setMapUnloaded();
  }

  public onBottomSheetDismiss(e: Event) {
    this.drawerService.closeDrawer();
  }

  public isDataLoading(): boolean {
    return this.layerService.isDataLoading();
  }

  public listDataLoading(): string[] {
    return this.layerService.getListLoadingData();
  }

  public openModal() {
    this.modal.present();
  }

  public async openActionSheet(type: string) {
    const modal = await this.modalCtrl.create({
      component: MobileHomeActionsComponent,
      componentProps: {
        type,
      },
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.25,
      cssClass: 'mobile-home-actions',
    });
    modal.present();
  }

  private initDrawer() {
    this.drawerService
      .onCurrentRouteChanged()
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((route: DrawerRouteEnum) => {
        this.currentRoute = route;
      });
    // Subscribe to drawer open changes
    this.drawerService
      .onDrawerHasBeenOpened()
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((opened: boolean) => {
        this.drawerHasBeenOpened = opened;
      });
    // Subscribe to drawer type changes
    this.drawerService
      .onDrawerTypeChanged()
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((drawerType: DrawerTypeEnum) => {
        this.drawerType = drawerType;
        //Fix for mobile version to stop bottom sheet scroll on scrollable content
        if (drawerType == DrawerTypeEnum.BOTTOM_SHEET) {
          setTimeout(() => {
            const sContents =
              document.getElementsByClassName('no-scroll-mobile');
            for (let content of Array.from(sContents)) {
              (content as any).ontouchmove = function (e) {
                e.stopPropagation();
              };
            }
          }, 1000);
        }
      });
  }

  private destroyDrawer() {
    // Unsubscribe drawer
    this.drawerUnsubscribe$.next();
    this.drawerUnsubscribe$.complete();
    // Destroy drawer listener
    this.drawerService.destroyDrawerListener();
  }

  private addHomeMapEvents(): void {
    fromEvent(this.mapService.getMap(), 'mousemove')
      .pipe(
        takeUntil(this.drawerUnsubscribe$),
        filter(() => !this.isMobile)
      )
      .subscribe((e) => {
        const canvasElement =
          document.getElementsByClassName('maplibregl-canvas')[0];
        if (this.drawingService.getIsMeasuring()) {
          canvasElement.classList.add('cursor-mesure');
          //for the area calculation box move
          const resumeBox = document.getElementById('calculation-box');
          if (resumeBox && this.drawingService.getShouldMooveResumeBox()) {
            const x = e.originalEvent.offsetX;
            const y = e.originalEvent.offsetY;
            resumeBox.style.transform = `translate(${x}px, ${y}px)`;
          }
        } else if (this.drawingService.getDrawActive()) {
          canvasElement.classList.add('cursor-pointer');
        } else {
          canvasElement.classList.remove('cursor-mesure');
          canvasElement.classList.remove('cursor-pointer');
        }
      });

    // Loading tiles event
    fromEvent(this.mapService.getMap(), 'moveend')
      .pipe(takeUntil(this.drawerUnsubscribe$), debounceTime(1500))
      .subscribe(() => {
        this.interactiveMap.onMoveEnd();
      });

    // Hovering feature event
    fromEvent(this.mapService.getMap(), 'mousemove')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapLayerService.queryNearestFeature(e);
        this.onFeatureHovered(nearestFeature);
      });

    // Click on feature event
    fromEvent(this.mapService.getMap(), 'click')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapLayerService.queryNearestFeature(e);
        if (nearestFeature?.properties?.['cluster']) {
          this.onClusterSelected(nearestFeature, e);
        } else {
          this.onFeatureSelected(nearestFeature, e);
        }
      });

    fromEvent(this.mapService.getMap(), 'touchend')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        if (!this.preventTouchMoveClicked) {
          const nearestFeature = this.mapLayerService.queryNearestFeature(e);
          this.onFeatureSelected(nearestFeature, e);
        } else {
          setTimeout(() => {
            this.preventTouchMoveClicked = false;
          }, 500);
        }
      });

    fromEvent(this.mapService.getMap(), 'touchmove')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe(() => {
        this.preventTouchMoveClicked = true;
      });

    // Right click, as context menu, event
    fromEvent(this.mapService.getMap(), 'contextmenu')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {
        const nearestFeature = this.mapLayerService.queryNearestFeature(e);
        this.interactiveMap.openNomadContextMenu(e, nearestFeature);
      });

    // Ending zoom event
    fromEvent(this.mapService.getMap(), 'zoom')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe(() => {
        this.preventTouchMoveClicked = true;
      });

    // Drawing event
    fromEvent(this.mapService.getMap(), 'draw.create')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: any) => {
        if (!this.drawingService.getIsMeasuring()) {
          this.drawingService.setDrawActive(false);
          this.drawingService.deleteDrawing();
          const fireEvent = this.mapEventService.isFeatureFiredEvent;

          const features = this.drawingService.getFeaturesFromDraw(
            e,
            this.mapService.getMap(),
            this.mapService.getCurrentLayersIds()
          );

          if (fireEvent) {
            this.mapEventService.setMultiFeaturesSelected(features);
          }

          if (!fireEvent) {
            if (features.length > 0) {
              this.drawerService.navigateWithEquipments(
                DrawerRouteEnum.SELECTION,
                features
              );
            }
          }
        } else {
          this.interactiveMap.setMeasure(
            this.drawingService.calculateMeasure()
          );
          this.drawingService.stopMooveMesureBox();
          const canvasElement =
            document.getElementsByClassName('maplibregl-canvas')[0];
          if (canvasElement.classList.contains('cursor-mesure')) {
            canvasElement.classList.remove('cursor-mesure');
          }
        }
      });

    // updating draw
    fromEvent(this.mapService.getMap(), 'draw.render')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: any) => {
        if (this.drawingService.getIsMeasuring()) {
          this.interactiveMap.setMeasure(
            this.drawingService.calculateMeasure()
          );
        }
      });

    // updating draw
    fromEvent(this.mapService.getMap(), 'draw.update')
      .pipe(takeUntil(this.drawerUnsubscribe$))
      .subscribe((e: any) => {
        this.interactiveMap.setMeasure(this.drawingService.calculateMeasure());
      });
  }

  /**
   * This function changes the cursor style and highlights a hovered feature on a map.
   * @param feature - Closest feature hovered on the map
   */
  private onFeatureHovered(feature: Maplibregl.MapGeoJSONFeature): void {
    if (!feature || feature.id == null) {
      this.mapService.getMap().getCanvas().style.cursor = '';
      this.mapEventService.highlightHoveredFeatures(
        this.mapService.getMap(),
        undefined,
        true
      );
      return;
    }

    this.mapService.getMap().getCanvas().style.cursor = 'pointer';
    this.mapEventService.highlightHoveredFeatures(
      this.mapService.getMap(),
      [{ source: feature.source, id: feature.id.toString() }],
      true
    );
  }

  /**
   * This function highlights a selected feature on a map.
   * @param feature - Closest feature selected on the map
   * @returns It navigates to a specific route in the application's drawer with some additional
   * properties.
   */
  private onFeatureSelected(
    feature: Maplibregl.MapGeoJSONFeature,
    e: Maplibregl.MapMouseEvent
  ): void {
    if (!feature) {
      return;
    }

    // In certain functions like multi-eq, putting isFeatureFiredEvent to false come faster than the rest of this function
    // With firedEvent, the value stays to the original isFeatureFiredEvent, avoiding asynchronous weird things
    const firedEvent = this.mapEventService.isFeatureFiredEvent;

    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      [{ source: feature.source, id: feature.id.toString() }],
      firedEvent,
      e
    );

    if (!firedEvent) {
      const properties = feature.properties;
      if (properties['geometry']) delete properties['geometry'];
      // We pass the layerKey to the drawer to be able to select the equipment on the layer
      properties['lyrTableName'] = feature.source;
      let route: DrawerRouteEnum;
      let params = {};
      let pathVariables = [];
      switch (feature.source) {
        case 'task':
          route = DrawerRouteEnum.TASK_VIEW;
          pathVariables = [properties['wkoId'], properties['id']];
          break;
        default:
          route = DrawerRouteEnum.EQUIPMENT;
          params = {
            lyrTableName: properties['lyrTableName'],
          };
          pathVariables = [properties['id']];
          break;
      }
      this.drawerService.navigateTo(route, pathVariables, params);
    }
  }

  private onClusterSelected(
    feature: Maplibregl.MapGeoJSONFeature,
    e: Maplibregl.MapMouseEvent
  ): void {
    const features = this.mapService.getMap().queryRenderedFeatures(e.point, {
      layers: [feature.layer.id],
    });
    const clusterId = features[0].properties['cluster_id'];
    const source = this.mapService
      .getMap()
      .getSource(features[0].source) as Maplibregl.GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      this.mapService.getMap().easeTo({
        center: this.utilsService.getAverageOfCoordinates(
          features.map((f) => f.geometry['coordinates'])
        ),
        zoom,
      });
    });
  }
}
