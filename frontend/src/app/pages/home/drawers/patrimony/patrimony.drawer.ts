import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { patrimonyFilterMock } from 'src/app/core/mocks/filter-patrimony.mock';
import { FavoriteData, FavoriteFilter, FavoriteItem } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
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
    return this.filter.segments.some((segment) => segment.selected && segment.components.some((component) => component.getType() === 'favoriteFilter'))
  };

  isModifyFavorite = () => {
    let selectedSegment = this.filter.segments.find(segment => segment.selected);

    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component.getType() === 'favoriteFilter') {
          for (let data of component.data) {
            let favoriteData: FavoriteData = data;
            if (favoriteData.value) {
              if (selectedSegment && selectedSegment.selected && selectedSegment.id === favoriteData.segmentId) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  isSelectedDataOnSegment = () => {
    return this.filter.segments.some((segment) => segment.selected && segment.components.some((component) => component.isSelectedData()))
  };

  isSelectedData = () => {
    return this.filter.segments.some((segment) => segment.components.some((component) => component.isSelectedData()))
  };

  reset() {
    this.filter.segments.forEach((segment) => {
      segment.components.forEach((component) => {
        component.reset(this.mapService);
      });
    });
  }

  modifyFavorite(inputfavoriteData: FavoriteData | undefined): void {
    let selectedFavoriteData: FavoriteData | undefined = inputfavoriteData;
    let favoriteItems: FavoriteItem[] = [];

    for (let segment of this.filter.segments) {
      for (let component of segment.components) {
        if (component instanceof FavoriteFilter) {
          for (let data of component.data) {
            let favoriteData: FavoriteData = data;
            if (favoriteData.value) {
              if (!selectedFavoriteData) {
                selectedFavoriteData = favoriteData;
              }
            }
          }
        }
        if (segment.selected) {
          favoriteItems = [...favoriteItems, ...component.getFavorites()];
        }
      }
    }

    if (selectedFavoriteData) selectedFavoriteData.dataSave = favoriteItems;
  }

  async addFavorite() {
    const favoriteSegment = this.filter.segments.find((segment) =>
      segment.components.some((component) => component instanceof FavoriteFilter)
    );
    const favoriteComponent = favoriteSegment?.components.find(
      (component) => component instanceof FavoriteFilter
    ) as FavoriteFilter | undefined;
    const selectedSegment = this.filter.segments.find((segment) => segment.selected);

    let defaultName = '';
    if (favoriteComponent) {
      defaultName = `${selectedSegment?.name} - favoris - ${favoriteComponent.data.length + 1}`;
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
            if (!favoriteComponent) {
              return;
            }

            favoriteComponent.data.forEach((favorite) => {
              favorite.value = false;
              if (favorite.name === alertData.name) {
                if (favorite.name.match(/[0-9]$/)) {
                  const val = Number(favorite.name.match(/[0-9]$/)![0]) + 1;
                  alertData.name = alertData.name.replace(/[0-9]$/, `${val}`);
                } else {
                  alertData.name = `${alertData.name} - 1`;
                }
              }
            });

            const newFavorite: FavoriteData = {
              id: favoriteComponent.data.length + 1,
              name: alertData.name,
              position: favoriteComponent.data.length + 1,
              segmentId: selectedSegment?.id,
              value: true,
            };

            favoriteComponent.data.push(newFavorite);

            this.modifyFavorite(newFavorite);
          },
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Intitulé du favoris',
          value: defaultName,
        },
      ],
    });

    await alert.present();
  }
}
