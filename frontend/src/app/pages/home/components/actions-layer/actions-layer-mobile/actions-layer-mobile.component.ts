import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal, MenuController } from '@ionic/angular';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import * as Maplibregl from 'maplibre-gl';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { CityService } from 'src/app/core/services/city.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { Router } from '@angular/router';

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
    private mapService: MapService,
    private layerService: LayerService,
    private router: Router
  ) {}

  @ViewChild('searchModal') searchModal: IonModal;

  @Input() currentRoute: DrawerRouteEnum;

  public drawerRouteEnum = DrawerRouteEnum;
  public adresses: any[] = [];
  public adress: string = "";
  public selectedsearchMode: string = "Adresse";
  public genericSearResult: any;

  private marker: Maplibregl.Marker;
  private patrimonyMinimunLengh: number = 8;

  ngOnInit() {}

  public openMenu(): void {
    this.menuCtlr.open();
  }

  public openSearchModal(): void {
    this.searchModal.present();
  }

  public onSearchInput(event) {
    const query = event.target.value.toLowerCase();
    switch (this.selectedsearchMode) {
      case 'Patrimoine':
        if ( query && query.length > this.patrimonyMinimunLengh){
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
            console.log(res);
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
      this.onAdressClick(this.adresses[0]);
    }
  }
  public modeChange(data: any): void {
    this.selectedsearchMode = data?.detail?.value;
  }

  public onResultClick(result: any) {
    if (result) {
      const id= result.id;
      const layer =  result.asset_tbl.replace('asset.','');
      this.router.navigate(['home/equipment/'+ id], {queryParams: {lyrTableName  :layer  }} );
      this.genericSearResult = [];
    }
  }
}
