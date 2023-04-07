import { Component, OnInit, OnDestroy, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import Feature from 'ol/Feature';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import {
  InterventionFilter,
} from 'src/app/core/models/filter/filter-component-models/InterventionFilter.model';
import { FilterType } from 'src/app/core/models/filter/filter-segment.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { InterventionStatusEnum, MapFeature } from 'src/app/core/models/map-feature.model';
import { FilterService } from '../filter.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-filter-card',
  templateUrl: './filter-card.component.html',
  styleUrls: ['./filter-card.component.scss'],
})
export class FilterCardComponent implements OnInit, OnDestroy {
  constructor(
    private layerService: LayerService,
    private mapEvent: MapEventService,
    private drawer: DrawerService,
  ) {
    this.mapEvent
      .getFeatureHoverd()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((f: Feature | undefined) => {
        if(f) {
          this.featureHovered = f.getId()?.toString();
          let elem = document.getElementById('interv-'+this.featureHovered);
          if(elem){
            document.getElementsByClassName('filter-content')[1].scroll({
              top: (elem.offsetTop-130), 
              left: 0, 
              behavior: 'smooth'
            });
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

  @Output() onLoadingEvent: EventEmitter<void> = new EventEmitter();
  
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

  onIonInfinite(ev: any) {
    this.onLoadingEvent.next();
  }

  public highlightFeature(featureId: string): void {
    this.layerService.highlightFeature(
      this.type,
      featureId
    );
  }

  public openFeature(featureId: string): void {
    // Need to check intervention or demande later
    const feature: Feature = this.layerService.getFeatureById(
      this.type,
      featureId
    )!;
    this.drawer.navigateTo(
      DrawerRouteEnum.INTERVENTION,
      [featureId],
      feature.getProperties()
    );
  }
}
