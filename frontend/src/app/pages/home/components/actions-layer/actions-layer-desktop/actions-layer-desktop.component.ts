import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonPopover, IonRadioGroup, IonSearchbar } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { CityService } from 'src/app/core/services/city.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import * as Maplibregl from 'maplibre-gl';
import { MapService } from 'src/app/core/services/map/map.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { Router } from '@angular/router';
import { MapEventService } from 'src/app/core/services/map/map-event.service';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit, OnDestroy {
  constructor(
    private cityService: CityService,
    private drawingService: DrawingService,
    private mapLayerService: MapLayerService,
    private mapService: MapService,
    private layerService: LayerService,
    private mapEvent: MapEventService,
    private router: Router
  ) {
    this.mapEvent
      .onAddressSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((address) => this.onAdressClick(address));
  }

  @ViewChild('toolbox', { static: true }) toolboxPopover: IonPopover;
  @ViewChild('searchbar', { static: true }) searchbar: IonSearchbar;

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isToolboxOpen: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private marker: Maplibregl.Marker;

  public adresses: any[] = [];
  public searchResult: string = '';
  public genericSearResult: any;
  public isSearching = false;
  public isSearchOption = false;
  public patrimonySearchInput: string = '';
  public modeVisible: boolean = true;
  public searchModeLibelle: string= 'Adr';
  public selectedsearchMode: string;


  private patrimonyMinimunLengh: number = 8;

  ngOnInit() {
    this.selectedsearchMode = 'Adresse';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onAction(route: DrawerRouteEnum) {
    this.selectedActionEvent.emit(route);
  }

  public onClickDrawingPolygone(): void {
    this.toolboxPopover.dismiss();
    this.drawingService.setDrawMode('draw_polygon');
  }

  public onClickDrawingRectangle(): void {
    this.toolboxPopover.dismiss();
    this.drawingService.setDrawMode('draw_rectangle');
  }

  public displayToolbox(e: Event): void {
    if (this.drawingService.getIsMeasuring()) {
      this.drawingService.endMesure(true);
    }
    this.toolboxPopover.event = e;
    this.isToolboxOpen = true;
  }

  public modeChange(data: any): void {
    const t= this.searchbar.value='';
    this.modeVisible = true;
    this.selectedsearchMode = data?.detail?.value;
    this.searchModeLibelle = this.selectedsearchMode ==='Patrimoine' ? 'Patr.' : 'Adr.';
  }

  public optionChanged (e: Event): void {
    this.modeVisible = false;
    this.adresses = [];
    this.genericSearResult = undefined;
  }

  public async onClickDisplayPrintTool(): Promise<void> {
    // Allows waiting for the action selection toolbox to be hidden
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    // Print
    window.print();
  }

  public async onClickDisplaySurfaceMesureTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.drawingService.setDrawMode('draw_polygon');
    this.drawingService.setIsMeasuring(true);
  }

  public async onClickDisplayLinearMesureTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.drawingService.setDrawMode('draw_line_string');
    this.drawingService.setIsMeasuring(true);
  }

  public onSearchInput(event) {
    this.modeVisible = true;
    const query = event.target.value.toLowerCase();
    switch (this.selectedsearchMode) {
      case 'Patrimoine':
        if ( query && query.length > this.patrimonyMinimunLengh){
          // this.isGenericSearching = true;
          this.layerService.getAssetByPartialId(query).subscribe((res) => {
            if (res) {
              this.genericSearResult = res;
            }
            else {
              this.genericSearResult = undefined;
            }
        });
      }
        break;
      default:
        if(query && query.length > 3) {
          this.cityService.getAdressesByQuery(query).then(res => {
            this.adresses = res.features;
          })
        } else {
          this.adresses = [];
        }
        break;
    }
    if (this.marker) {
      this.marker.remove();
    }
  }

  public onSeachEnter() {
    this.modeVisible = true;
    this.isSearching = true;
  }

  public onFilterOptionClick() {
    this.isSearchOption = true;
  }


  public ionChanged(data: any) {
    this.selectedsearchMode = data?.detail?.value;
  }
  public onAdressClick(adress: any) {
    this.searchResult = adress.properties.label;
    this.mapLayerService.moveToXY(
      'home',
      adress.geometry.coordinates[0],
      adress.geometry.coordinates[1],
      19
    );
    if (this.marker) {
      this.marker.remove();
    }
    this.marker = new Maplibregl.Marker({
      color: '#ea4335',
      draggable: false,
    })
      .setLngLat([
        adress.geometry.coordinates[0],
        adress.geometry.coordinates[1],
      ])
      .addTo(this.mapService.getMap('home'));
    this.adresses = [];
  }

  public onResultClick(result: any) {
    if (result) {
      this.OpenAssetResult(result);
    }
  }

  private OpenAssetResult(result: any) {
    const id = result.id;
    const layer = result.asset_tbl.replace('asset.', '');
    this.router.navigate(['home/equipment/' + id], { queryParams: { lyrTableName: layer } });
    this.searchResult = id;
    this.genericSearResult = [];
  }

  public onSearchbarFocusOut() {
    setTimeout(() => {
      this.adresses = [];
      this.genericSearResult = [];
    }, 200);
    setTimeout(() => {
      this.isSearching = false;
    }, 500);
  }

  public onSearchKeyEnter() {
    if (this.adresses && this.adresses.length > 0) {
      this.mapLayerService.moveToXY(
        'home',
        this.adresses[0].geometry.coordinates[0],
        this.adresses[0].geometry.coordinates[1],
        19
      );
      if (this.marker) {
        this.marker.remove();
      }
      this.marker = new Maplibregl.Marker({
        color: '#ea4335',
        draggable: false,
      })
        .setLngLat([
          this.adresses[0].geometry.coordinates[0],
          this.adresses[0].geometry.coordinates[1],
        ])
        .addTo(this.mapService.getMap('home'));
      this.searchResult = this.adresses[0].properties.label;
      this.adresses = [];
    }
    else if(this.genericSearResult && this.genericSearResult[0]){
      this.OpenAssetResult(this.genericSearResult[0]);
    }
  }
}
