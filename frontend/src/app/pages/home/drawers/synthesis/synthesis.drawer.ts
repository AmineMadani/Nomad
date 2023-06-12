import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { ActivatedRoute } from '@angular/router';

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
export class SynthesisDrawer implements OnInit, OnDestroy {
  constructor(
    private utils: UtilsService,
    private layerService: LayerService,
    private mapEventService: MapEventService,
    private drawerService: DrawerService,
    private mapService: MapService,
    private route: ActivatedRoute
  ) {}

  @Input() drawerTitle: string;
  @Input() hasFile: boolean = false;
  @Input() tabButtons: SynthesisButton[];
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() footerTemplate: TemplateRef<any>;
  @Input() sourceLayer: string;
  @Output() onAttachFile: EventEmitter<void> = new EventEmitter();
  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();
  @Output() onInitComponent: EventEmitter<void> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
    const urlParams = new URLSearchParams(window.location.search);
    let paramMap = new Map(urlParams.entries());
    if (this.mapService.getMap()) {
      this.zoomToFeature(paramMap);
    } else {
      this.mapService.onMapLoaded().subscribe(() => {
        this.zoomToFeature(paramMap);
      });
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

  private zoomToFeature(params: any): void {
    this.route.params.subscribe(localParam => {
      this.layerService.moveToXY(params.get('x'), params.get('y')).then(() => {
        if (localParam['id'] && params.get('lyr_table_name')) {
          this.layerService.zoomOnXyToFeatureByIdAndLayerKey(params.get('lyr_table_name'),localParam['id']).then( () => {
            this.onInitComponent.emit();
          });
        }
      });
    });
  }
}