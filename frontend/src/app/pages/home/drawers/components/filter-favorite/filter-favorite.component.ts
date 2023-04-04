import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FavData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-filter-favorite',
  templateUrl: './filter-favorite.component.html',
  styleUrls: ['./filter-favorite.component.scss'],
})
export class FilterFavoriteComponent implements OnInit {
  constructor(
    private favService: FavoriteService,
    private alertCtrl: AlertController,
    private mapService: MapService
  ) {}

  @Input() data: FavData[];
  public currentFavOpen: FavData | undefined;

  ngOnInit() {}

  public getCurrentFavorite(): FavData | undefined {
    return this.favService.getSelectedFavorite();
  }

  checkOpeningRule(data: FavData): void {
    if (this.currentFavOpen === data) {
      this.currentFavOpen = undefined;
    } else {
      this.currentFavOpen = data;
    }
  }

  public onFavoriteSelected(e: Event): void {
    const fav: FavData = (e as CustomEvent).detail.value;
    if (fav) {
      this.favService.setCurrentFavorite(fav);
    } else {
      this.favService.removeCurrentFavorite();
    }
  }

  public async renameFav(fav: FavData): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Voulez-vous renommer le favori ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          role: 'confirm',
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Nom du favori',
          value: fav.name
        }
      ]
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.favService.renameFavorite(fav, data.values.name);
    }
  }

  public async delFav(data: FavData): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Voulez-vous supprimer le favori ${data.name} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          role: 'confirm',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.favService.deleteFavorite(data);
      this.reset();
    }
  }

  reset() {
    this.favService.getFilter().segments.forEach((segment) => {
      segment.components.forEach((component) => {
        component.reset();
      });
    });
    this.mapService.resetLayers();
    this.favService.removeCurrentFavorite();
  }
}
