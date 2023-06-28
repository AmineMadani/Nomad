import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Favorite, User } from 'src/app/core/models/user.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-asset-favorite',
  templateUrl: './asset-favorite.component.html',
  styleUrls: ['./asset-favorite.component.scss'],
})
export class AssetFavoriteComponent implements OnInit {

  constructor(
    private userService: UserService,
    private alertCtrl: AlertController,
    public assetFilterService: AssetFilterService
  ) { }

  public user: User;
  public currentFavOpen: Favorite | undefined;
  public selectedFavorite: string | undefined;

  ngOnInit() {
    this.userService.getUser().then(usr => {
      if (usr.usrConfiguration?.favorites) {
        this.user = usr;
      }
    });
    this.selectedFavorite = this.assetFilterService.selectedFavorite?.name;
  }

  public onOpenAccordion(data: Favorite): void {
    if (this.currentFavOpen === data) {
      this.currentFavOpen = undefined;
    } else {
      this.currentFavOpen = data;
    }
  }

  public onApplyFavorite(favorite: Favorite) {
    if(this.assetFilterService.selectedFavorite && this.assetFilterService.selectedFavorite.name == favorite.name) {
      this.assetFilterService.reset();
    } else {
      this.assetFilterService.applyFavorite(favorite);
    }
  }

  public async renameFavorite(fav: Favorite): Promise<void> {
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
      fav.name = data.values.name;
      this.userService.setUser(this.user);
    }
  }

  public async deleteFavorite(data: Favorite): Promise<void> {
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
      this.user.usrConfiguration.favorites.forEach((favorite, index) => {
        if (favorite.name == data.name) {
          this.user.usrConfiguration.favorites.splice(index, 1);
        }
      });
      this.userService.setUser(this.user);
      if(this.assetFilterService.selectedFavorite && this.assetFilterService.selectedFavorite.name === data.name){
        this.assetFilterService.selectedFavorite = undefined;
      }
    }
  }

}
