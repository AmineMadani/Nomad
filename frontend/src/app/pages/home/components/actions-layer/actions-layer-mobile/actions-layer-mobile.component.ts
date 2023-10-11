import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import * as Maplibregl from 'maplibre-gl';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { CityService } from 'src/app/core/services/city.service';

@Component({
  selector: 'app-actions-layer-mobile',
  templateUrl: './actions-layer-mobile.component.html',
  styleUrls: ['./actions-layer-mobile.component.scss'],
})
export class ActionsLayerMobileComponent implements OnInit {

  constructor(
    private menuCtlr: MenuController,
    private mapLayerService: MapLayerService,
    private cityService: CityService,
    private mapService: MapService
  ) {}

  @Input() currentRoute: DrawerRouteEnum;

  private marker: Maplibregl.Marker;

  public drawerRouteEnum = DrawerRouteEnum;
  public adresses: any[] = [];
  public adress: string = "";

  ngOnInit() {}

  public openMenu(): void {
    this.menuCtlr.open();
  }

  public onSearchInput(event) {
    const query = event.target.value.toLowerCase();
    if(query && query.length > 3) {
      this.cityService.getAdressesByQuery(query).subscribe(res => {
        this.adresses = res.features;
      })
    } else {
      this.adresses = [];
      this.adress = query;
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
