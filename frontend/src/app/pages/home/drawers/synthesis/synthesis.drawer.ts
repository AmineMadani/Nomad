import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { boundingExtent } from 'ol/extent';
import { transform } from 'ol/proj';
import { Location } from '@angular/common';
import { MapService } from 'src/app/core/services/map/map.service';
import { defer, fromEvent, merge, EMPTY, of, firstValueFrom, zip, forkJoin } from 'rxjs';
import { first, switchMap, takeUntil, tap, filter, take } from 'rxjs/operators';
import { MapEventService } from 'src/app/core/services/map/map-event.service';

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
    private router: ActivatedRoute,
    private utils: UtilsService,
    private layerService: LayerService,
    private drawerService: DrawerService,
    private mapService: MapService,
    private mapEvent: MapEventService,
    private location: Location
  ) {}

  @Input() drawerTitle: string;
  @Input() hasFile: boolean = false;
  @Input() tabButtons: SynthesisButton[];
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() sourceLayer: string;
  @Output() onAttachFile: EventEmitter<void> = new EventEmitter();
  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
    this.router.queryParams
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        switchMap((params) => {
          if (this.checkIfSourceLoaded(params['layer'])) {
            return of([params]);
          }
          return forkJoin([
            of(params),
            this.mapService.onMapLoaded().pipe(take(1)),
          ]);
        })
      )
      .subscribe((params) => {
        this.zoomToFeature(params[0]);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ionViewWillLeave(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
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
    const { id, layer } = params;
    if (id && layer) {
      this.layerService.zoomOnXyToFeatureByIdAndLayerKey(layer, id);
    }
  }

  /**
   * This function checks if a source is loaded on a map in TypeScript.
   * If isSourceLoaded is false, which is important to know, the lib logs an error,
   * so the getSource & try/catch are here to prevent this awful log
   * @param {string} source - Name of the source to be checked
   * @returns A boolean value is being returned.
   */
  private checkIfSourceLoaded(source: string): boolean {
    try {
      return (
        this.mapService.getMap().getSource(source) &&
        this.mapService.getMap().isSourceLoaded(source)
      );
    } catch (e) {
      return false;
    }
  }
}