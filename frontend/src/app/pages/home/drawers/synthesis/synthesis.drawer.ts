import { Component, OnInit, OnDestroy, Input, Output, TemplateRef, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { filter, from, switchMap } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { LayerService } from 'src/app/core/services/layer.service';

export interface SynthesisButton {
  key: string;
  label: string;
  icon: string;
  disabledFunction?: () => boolean;
}

@Component({
  selector: 'app-synthesis',
  templateUrl: './synthesis.drawer.html',
  styleUrls: ['./synthesis.drawer.scss'],
})
export class SynthesisDrawer implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private utils: UtilsService,
    private mapLayerService: MapLayerService,
    private mapEventService: MapEventService,
    private drawerService: DrawerService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private layerService: LayerService
  ) { }

  @ViewChild('content', { static: true }) content: ElementRef;
  @ViewChild('footer', { static: true }) footer: ElementRef;

  @Input() drawerTitle: string;
  @Input() titleLoading: boolean;
  @Input() hasFile: boolean = false;
  @Input() tabButtons: SynthesisButton[];
  @Input() tabDisabled: boolean;
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() footerTemplate: TemplateRef<any>;
  @Input() sourceLayer: string;

  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();
  @Output() onInitComponent: EventEmitter<any> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
    const urlParams = new URLSearchParams(window.location.search);
    const paramMap = new Map(urlParams.entries());
    this.mapService.onMapLoaded().pipe(
      filter((isMapLoaded) => isMapLoaded),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(() => {
      this.zoomToFeature(paramMap);
    });
  }

  ngAfterViewInit(): void {
    if (!this.isMobile && this.footer.nativeElement.children) {
      this.content.nativeElement.classList.add('content-without-footer');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      undefined
    );
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      undefined,
    );
    this.drawerService.closeDrawer();
  }

  public onTabButtonClicked(button: SynthesisButton): void {
    this.onTabButton.emit(button);
  }

  public onDetailsClicked(): void {
    this.onDetails.emit();
  }

  private zoomToFeature(params: Map<string, string>): void {
    this.route.params
      .pipe(
        switchMap((param: Params) => {
          if (params.has('lyrTableName') && !params.get('lyrTableName').includes('_xy') && params.size === 1) {
            return from(
              this.layerService.getEquipmentByLayerAndId(
                params.get('lyrTableName'),
                param['id']
              )
            );
          } else {
            return this.layerService.getEquipmentsByLayersAndIds(
              this.utils.transformMap(params)
            );
          }
        })
      )
      .subscribe(async (feature: any | any[]) => {
        if (!feature || feature.length === 0) {
          this.onInitComponent.emit(null);
          return;
        }

        // Mono-Equipment
        if (!Array.isArray(feature)) {
          const  layers = await this.layerService.getLayerByKey(params.get('lyrTableName'));
          const minZoom = (JSON.parse(layers.listStyle[0].sydDefinition)[0].minzoom)+1
          await this.mapLayerService.moveToXY(feature.x, feature.y,minZoom);
          await this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey(
            params.get('lyrTableName'),
            feature.id
          );
          this.onInitComponent.emit({
            ...feature,
            lyrTableName: params.get('lyrTableName'),
          });

          // Multi-Equipment
        } else {
          this.mapLayerService.fitBounds(
            feature.map((f) => {
              return [+f.x, +f.y];
            })
          );
          this.onInitComponent.emit(
            feature.map((f) => {
              return {
                ...f,
                lyrTableName: this.utils
                  .transformMap(params)
                  .find((map) => map.equipmentIds.includes(f.id)).lyrTableName,
              };
            })
          );
        }
      });
  }
}
