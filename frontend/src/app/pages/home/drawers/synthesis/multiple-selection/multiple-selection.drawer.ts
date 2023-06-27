import { Component, OnInit, OnDestroy } from '@angular/core';
import { SynthesisButton } from '../synthesis.drawer';
import {
  ActivatedRoute,
  NavigationEnd,
  ParamMap,
  Router,
} from '@angular/router';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Subject, takeUntil, filter } from 'rxjs';
import * as Maplibregl from 'maplibre-gl';
import { Layer } from 'src/app/core/models/layer.model';

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.drawer.html',
  styleUrls: ['./multiple-selection.drawer.scss'],
})
export class MultipleSelectionDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private mapService: MapService,
    private layerService: LayerService,
    private drawerService: DrawerService,
    private mapEvent: MapEventService
  ) {}

  public buttons: SynthesisButton[] = [
    { key: 'add', label: 'Ajouter un élement', icon: 'add' },
    { key: 'create', label: 'Générer une intervention', icon: 'person-circle' },
    { key: 'ask', label: 'Faire une demande de MAJ', icon: 'refresh' },
  ];

  public featuresSelected: any[] = [];
  public filteredFeatures: any[] = [];
  public sources: { key: string; label: string }[] = [];
  public isLoading: boolean = false;

  private layersConf: Layer[] = [];
  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit() {
    // Params does not trigger a refresh on the component, when using polygon tool, the component need to be refreshed manually
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paramMap = new Map(urlParams.entries());
        this.featuresSelected = [];
        this.filteredFeatures = [];
        this.sources = [];
        this.layersConf = [];
        this.onInitSelection(paramMap);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public trackByFn(index: number, feature: any): number {
    return feature.id;
  }

  public onInitSelection(paramsMap: Map<string, string>): void {
    this.isLoading = true;
    const abstractFeatures = this.convertToObjectArray(paramsMap);
    this.addLayerToMap(abstractFeatures);
    this.layerService.fitBounds(
      abstractFeatures.map((absF) => {
        return [+absF.x, +absF.y];
      })
    );
  }

  public async addLayerToMap(abstractFeatures: any[]): Promise<void> {
    const promises: Promise<void>[] = abstractFeatures.map(
      ({ lyr_table_name }) => {
        return this.mapService.addEventLayer(lyr_table_name);
      }
    );

    await Promise.all(promises);

    this.sources = [
      ...new Set(abstractFeatures.map(({ lyr_table_name }) => lyr_table_name)),
    ].map((lyrName: string) => {
      const conf = this.mapService.getLayer(lyrName).configurations;
      this.layersConf.push(conf);
      return { key: lyrName, label: conf.lyrSlabel };
    });

    this.featuresSelected = abstractFeatures.map((absF: any) => {
      return {
        ...this.layerService.getFeatureById(absF.lyr_table_name, absF.id)
          .properties,
        lyr_table_name: absF.lyr_table_name,
      };
    });
    this.filteredFeatures = this.featuresSelected;

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.featuresSelected.map((f: any) => {
        return { id: f.id, source: f.lyr_table_name };
      })
    );

    this.isLoading = false;
  }

  public onTabButtonClicked(e: any): any {}

  public handleChange(e: Event): void {
    const event: CustomEvent = e as CustomEvent;
    if (event.detail.value?.length > 0) {
      this.filteredFeatures = this.featuresSelected.filter((f) =>
        event.detail.value.includes(f.lyr_table_name)
      );
    } else {
      this.filteredFeatures = this.featuresSelected;
    }
  }

  public openFeature(feature: any): void {
    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [feature.id], {
      x: feature.x,
      y: feature.y,
      lyr_table_name: feature.lyr_table_name,
    });
  }

  public removeFeature(e: Event, feature: any): void {
    e.stopPropagation();
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
    this.mapEvent.removeFeatureFromSelected(
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

  private convertToObjectArray(paramsMap: Map<string, string>): any[] {
    return Array.from(paramsMap.entries()).map(([key, value]) => {
      const params = new URLSearchParams(value);
      const obj = Object.fromEntries(params);
      return obj;
    });
  }
}
