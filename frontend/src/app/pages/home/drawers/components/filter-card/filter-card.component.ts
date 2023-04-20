import { Component, OnInit, OnDestroy, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import Feature from 'ol/Feature';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-filter-card',
  templateUrl: './filter-card.component.html',
  styleUrls: ['./filter-card.component.scss'],
})
export class FilterCardComponent implements OnInit, OnDestroy {
  constructor(
    private layerService: LayerService,
    private mapEvent: MapEventService,
  ) {
    this.mapEvent
      .getFeatureHoverd()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((f: Feature | undefined) => {
        if(f) {
          this.featureHovered = f.getId()?.toString();
          const feature = document.getElementById('feature-' + this.featureHovered);
          if(feature){
            const ionContent: any = document.getElementById('filter-content-scrollable');
            if(ionContent) {
              (ionContent as IonContent).scrollToPoint(0,feature.offsetTop,1000);
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
  
  public featureHovered: string | undefined;

  private ngUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {}

  // Security while Ionic Router still used
  ionViewWillLeave(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public highlightFeature(featureId: string): void {
    this.layerService.highlightFeature(
      this.type,
      featureId
    );
  }

  public onIonInfinite(ev: any) {
    this.onLoadingEvent.next(ev);
  }

  public openFeature(feature: MapFeature): void {
    this.onFeatureSelected.next(feature);
  }
}
