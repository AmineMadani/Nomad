import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { patrimonyFilterMock } from 'src/app/core/mocks/filter-patrimony.mock';
import { FavoriteData, FavoriteFilter, FavoriteItem } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { FilterSegment } from 'src/app/core/models/filter/filter-segment.model';
import { Filter } from 'src/app/core/models/filter/filter.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { MapService } from 'src/app/core/services/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-patrimony',
  templateUrl: './patrimony.drawer.html',
  styleUrls: ['./patrimony.drawer.scss'],
})
export class PatrimonyDrawer implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private alertController: AlertController,
    private mapService: MapService
  ) { }

  @ViewChild('scrolling') scrolling: ElementRef;

  filter: Filter = patrimonyFilterMock;

  ngOnInit() {
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

  asIsOrder(a: any, b: any) {
    return a.value.position - b.value.position;
  }

  isFavoriteSegment = () => {
    for (let segment of this.filter.segments) {
      if (segment.selected) {
        for (let component of segment.components) {
          if (component.getType() === 'favoriteFilter') {
            return true;
          }
        }
      }
    }
    return false;
  }

  isModifyFavorite = () => {
    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component.getType() === 'favoriteFilter') {
          for (let data of component.data) {
            let favoriteData: FavoriteData = data;
            if (favoriteData.value) {
              for (let segmentPrime of this.filter.segments) {
                if (segmentPrime.selected && segmentPrime.id === favoriteData.segmentId) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  isSelectedDataOnSegment = () => {
    for (let segment of this.filter.segments) {
      if (segment.selected) {
        for (let component of segment.components) {
          if (component.isSelectedData()) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isSelectedData = () => {
    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component.isSelectedData()) {
          return true;
        }
      }
    }
    return false;
  }

  reset() {
    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        component.reset(this.mapService);
      }
    }
  }

  modifyFavorite(inputfavoriteData: FavoriteData|undefined): void {
    let selectedFavoriteData: FavoriteData | undefined = inputfavoriteData;
    let favoriteItems: FavoriteItem[] = [];

    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component instanceof FavoriteFilter) {
          for (let data of component.data) {
            let favoriteData: FavoriteData = data;
            if (favoriteData.value) {
              if(!selectedFavoriteData) {
                selectedFavoriteData = favoriteData;
              }
            }
          }
        }
        if(segment.selected){
          favoriteItems = [...favoriteItems,...component.getFavorites()];
        }
      }
    }

    if(selectedFavoriteData) selectedFavoriteData.dataSave=favoriteItems;
  }

  async addFavorite() {

    let favoriteComponent: FavoriteFilter | undefined;
    let favoriteSegment: FilterSegment | undefined;
    let selectedSegment: FilterSegment | undefined;
    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component instanceof FavoriteFilter) {
          favoriteComponent = component;
          favoriteSegment = segment;
        }
        if (segment.selected) {
          selectedSegment = segment;
        }
      }
    }

    let defaultName = '';
    if (favoriteComponent) {
      defaultName = selectedSegment?.name + ' - favoris - ' + (favoriteComponent?.data.length + 1);
    }


    const alert = await this.alertController.create({
      header: "Ajout d'un favori",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (alertData) => {

            if (favoriteComponent) {
              for (let favorite of favoriteComponent.data) {
                favorite.value=false;
                if (favorite.name === alertData.name) {
                  if (favorite.name.charAt(favorite.name.length - 1).match(/[0-9]/)) {
                    let val = Number(favorite.name.charAt(favorite.name.length - 1));
                    val++;
                    alertData.name = alertData.name.slice(0, -1) + val;
                  } else {
                    alertData.name = alertData.name + ' - 1';
                  }
                }
              }

              let newFavorite: FavoriteData = {
                id: favoriteComponent.data.length+1,
                name: alertData.name,
                position: favoriteComponent?.data.length + 1,
                segmentId: selectedSegment?.id,
                value: true,
              }

              favoriteComponent.data.push(newFavorite);

              this.modifyFavorite(newFavorite);
            }
          }
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Intitulé du favoris',
          value: defaultName
        },
      ],
    });

    await alert.present();
  }
}
