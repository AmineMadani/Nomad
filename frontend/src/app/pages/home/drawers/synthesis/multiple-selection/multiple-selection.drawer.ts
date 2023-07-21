import { Component, OnInit, OnDestroy } from '@angular/core';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Subject, takeUntil, filter, switchMap } from 'rxjs';
import { Layer } from 'src/app/core/models/layer.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.drawer.html',
  styleUrls: ['./multiple-selection.drawer.scss'],
})
export class MultipleSelectionDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private layerDataservice: LayerDataService,
    private mapService: MapService,
    private layerService: LayerService,
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private utils: UtilsService
  ) {
    // Params does not trigger a refresh on the component, when using polygon tool, the component need to be refreshed manually
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        switchMap(() => {
          const urlParams = new URLSearchParams(window.location.search);
          this.paramFeatures = this.utils.transformMap(
            new Map(urlParams.entries())
          );
          return this.layerDataservice.getEquipmentsByLayersAndIds(
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
        this.layerService.fitBounds(
          features.map((f) => {
            return [+f.x, +f.y];
          })
        );

        const equipments = features.map((f) => {
          return {
            ...f,
            lyr_table_name: this.paramFeatures.find((map) =>
              map.equipmentIds.includes(f.id)
            ).lyrTableName,
          };
        });
        this.onInitSelection(equipments);
      });
  }

  public buttons: SynthesisButton[] = [];

  public featuresSelected: any[] = [];
  public filteredFeatures: any[] = [];
  public sources: { key: string; label: string }[] = [];
  public isLoading: boolean = false;

  public wkoDraft: string;

  private layersConf: Layer[] = [];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private paramFeatures: any;

  ngOnInit() {
    this.wkoDraft =
      this.activatedRoute.snapshot.queryParams?.['redirect'];
    this.buttons = [
      { key: 'add', label: 'Ajouter un élement', icon: 'add' },
      {
        key: 'create',
        label: this.wkoDraft
          ? "Reprendre l'intervention"
          : 'Générer une intervention',
        icon: 'person-circle',
      },
      { key: 'ask', label: 'Faire une demande de MAJ', icon: 'refresh' },
    ];
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

  public onTabButtonClicked(e: SynthesisButton): void {
    switch (e.key) {
      case 'create':
        this.router.navigate(['/home/work-order'], {
          queryParams: {...this.generateFeatureParams(this.featuresSelected), draft: this.wkoDraft }
        });
        break;
      default:
        break;
    }
  }

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

  public generateFeatureParams(features: any[]): any {
    const featureParams: any = {};

    features.forEach((feature) => {
      const source = feature.lyr_table_name || feature.source;

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
}
