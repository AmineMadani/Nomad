import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonPopover } from '@ionic/angular';
import { Subject } from 'rxjs';

import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { CityService } from 'src/app/core/services/city.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import * as Maplibregl from 'maplibre-gl';
import { MapService } from 'src/app/core/services/map/map.service';

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
    private mapService: MapService
  ) {}

  @ViewChild('toolbox', { static: true }) toolboxPopover: IonPopover;

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isToolboxOpen: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();
  private marker: Maplibregl.Marker;

  public adresses: any[] = [];
  public adress: string = "";

  ngOnInit() {}

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
    const query = event.target.value.toLowerCase();
    if(query && query.length > 3) {
      this.cityService.getAdressesByQuery(query).then(res => {
        console.log(res);
        this.adresses = res.features;
      })
    } else {
      this.adresses = [];
    }
    if(this.marker) {
      this.marker.remove();
    }
  }

  public onAdressClick(adress: any) {
    this.adress = adress.properties.label;
    this.mapLayerService.moveToXY(adress.geometry.coordinates[0],adress.geometry.coordinates[1],19);
    if(this.marker) {
      this.marker.remove();
    }
    this.marker = new Maplibregl.Marker({
      color: "#ea4335",
      draggable: false
      }).setLngLat([adress.geometry.coordinates[0],adress.geometry.coordinates[1]])
      .addTo(this.mapService.getMap());
    this.adresses = [];
  }

  public onSearchbarFocusOut() {
    setTimeout(() => {
      this.adresses = [];
    }, 200);
  }

  public onSearchKeyEnter() {
    if(this.adresses && this.adresses.length > 0) {
      this.mapLayerService.moveToXY(this.adresses[0].geometry.coordinates[0],this.adresses[0].geometry.coordinates[1],19);
      if(this.marker) {
        this.marker.remove();
      }
      this.marker = new Maplibregl.Marker({
        color: "#ea4335",
        draggable: false
        }).setLngLat([this.adresses[0].geometry.coordinates[0],this.adresses[0].geometry.coordinates[1]])
        .addTo(this.mapService.getMap());
      this.adress = this.adresses[0].properties.label;
      this.adresses = [];
    }
  }
}
