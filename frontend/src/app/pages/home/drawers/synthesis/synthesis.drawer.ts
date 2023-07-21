import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Observable, filter, from, of, switchMap } from 'rxjs';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';

export interface SynthesisButton {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-synthesis',
  templateUrl: './synthesis.drawer.html',
  styleUrls: ['./synthesis.drawer.scss'],
})
export class SynthesisDrawer implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private utils: UtilsService,
    private layerService: LayerService,
    private mapEventService: MapEventService,
    private drawerService: DrawerService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private layerDataservice: LayerDataService,
    private exploitationDataservice: ExploitationDataService
  ) {}

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

  @Output() onAttachFile: EventEmitter<void> = new EventEmitter();
  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();
  @Output() onInitComponent: EventEmitter<any> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
    const urlParams = new URLSearchParams(window.location.search);
    const paramMap = new Map(urlParams.entries());
    if (this.mapService.getMap()) {
      this.zoomToFeature(paramMap);
    } else {
      this.mapService
        .onMapLoaded()
        .pipe(
          filter((isMapLoaded) => isMapLoaded),
          takeUntil(this.ngUnsubscribe$)
        )
        .subscribe(() => {
          this.zoomToFeature(paramMap);
        });
    }
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
    this.mapEventService.highlightSelectedFeature(
      this.mapService.getMap(),
      undefined,
      undefined
    );
    this.drawerService.closeDrawer();
  }

  public onTabButtonClicked(button: SynthesisButton): void {
    this.onTabButton.emit(button);
  }

  public onAttachFileClicked(): void {
    this.onAttachFile.emit();
  }

  public onDetailsClicked(): void {
    this.onDetails.emit();
  }

  private zoomToFeature(params: Map<string, string>): void {
    this.route.params
      .pipe(
        switchMap((param: Params) => {
          if (params.has('lyr_table_name') && params.size === 1) {
            return from(
              this.layerDataservice.getEquipmentByLayerAndId2(
                params.get('lyr_table_name'),
                param['id']
              )
            );
          } else {
            return this.layerDataservice.getEquipmentsByLayersAndIds(
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
          await this.layerService.moveToXY(feature.x, feature.y);
          await this.layerService.zoomOnXyToFeatureByIdAndLayerKey(
            params.get('lyr_table_name'),
            feature.id
          );
          this.onInitComponent.emit({
            ...feature,
            lyr_table_name: params.get('lyr_table_name'),
          });

          // Multi-Equipment
        } else {
          this.layerService.fitBounds(
            feature.map((f) => {
              return [+f.x, +f.y];
            })
          );
          this.onInitComponent.emit(
            feature.map((f) => {
              return {
                ...f,
                lyr_table_name: this.utils
                  .transformMap(params)
                  .find((map) => map.equipmentIds.includes(f.id)).lyrTableName,
              };
            })
          );
        }
      });
  }
}
