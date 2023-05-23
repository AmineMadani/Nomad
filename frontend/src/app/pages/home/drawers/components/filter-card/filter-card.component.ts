import { Component, OnInit, OnDestroy, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-filter-card',
  templateUrl: './filter-card.component.html',
  styleUrls: ['./filter-card.component.scss'],
})
export class FilterCardComponent implements OnInit, OnDestroy {
  constructor(
    private mapService: MapService,
    private mapEvent: MapEventService
  ) {
    this.mapEvent
      .onFeatureHovered()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((f: string | number | undefined) => {
        if (f) {
          this.featureHovered = f;
          const feature = document.getElementById(
            'feature-' + this.featureHovered
          );
          if (feature) {
            const ionContent: any = document.getElementById(
              'filter-content-scrollable'
            );
            if (ionContent) {
              (ionContent as IonContent).scrollToPoint(
                0,
                feature.offsetTop,
                1000
              );
            }
          }
        } else {
          this.featureHovered = undefined;
        }
      });
  }

  @Input() features: MapFeature[];
  @Input() type: string;
  @Input() titleTemplateRef: TemplateRef<any>;
  @Input() subtitleTemplateRef: TemplateRef<any>;
  @Input() labelTemplateRef: TemplateRef<any>;
  @Input() chipTemplateRef: TemplateRef<any>;
  @Input() fromCache: boolean;

  @Output() onLoadingEvent: EventEmitter<InfiniteScrollCustomEvent> = new EventEmitter();
  @Output() onFeatureSelected: EventEmitter<MapFeature> = new EventEmitter();

  public featureHovered: string | number | undefined;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit() { }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public trackByFn(index: number, feature: any): number {
    return feature.id;
  }

  public highlightFeature(feature: MapFeature | undefined): void {
    if (this.fromCache) {
      this.mapEvent.highlightHoveredFeature(
        this.mapService.getMap(),
        this.type,
        feature?.id ?? undefined
      );
    }
  }

  public onIonInfinite(ev: any) {
    this.onLoadingEvent.next(ev);
  }

  public openFeature(feature: MapFeature): void {
    this.onFeatureSelected.next(feature);
  }
}
