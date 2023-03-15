import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { FavoriteData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import { Filter } from 'src/app/core/models/filter/filter.model';
import { MapService } from 'src/app/core/services/map.service';

@Component({
  selector: 'app-filter-favorite',
  templateUrl: './filter-favorite.component.html',
  styleUrls: ['./filter-favorite.component.scss'],
})
export class FilterFavoriteComponent implements OnInit {

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private mapService: MapService
  ) { }

  @Input() datas: FavoriteData[];
  @Input() filter: Filter;

  ngOnInit() {
  }

  selectedIdFavorite = () => {
    for(let item of this.datas){
      if(item.value)  return item.id;
    }
    return undefined;
  };

  /**
   * Fill or clear the Set depending of the checkbox status.
   * The isIndeterminate ternary prevent the Set to change when onChildSelected trigger the checkbox update
   * @param {Event} e - Event (IonCheckboxCustomEvent) - event triggered when status changed (by clicking or changing isChecked value)
   */
  onCheckboxChange(e: Event, data: FavoriteData): void {
    this.resetFilter();
    data.value = !data.value;
    if(data.value) {
      this.datas.forEach(item => {
        if(item.id != data.id) {
          item.value=false;
        }
      });
      if(data.dataSave) this.applyFavorite(data);
    }
  }

  resetFilter(){
    for(let segment of this.filter.segments) {
      for(let component of segment.components){
        component.reset(this.mapService);
      }
    }
  }

  applyFavorite(favorite:FavoriteData){
    for(let segment of this.filter.segments) {
      if(segment.id === favorite.segmentId){
        for(let component of segment.components){
          if(favorite.dataSave) {
            for(let item of favorite.dataSave) {
              component.applyFavorite(this.mapService,item);
            }
          }
        }
      }
    }
  }
  
  /**
   * If the accordeon has no children or is in md mode, then stop the event
   * from propagating thus preventing open state.
   * Otherwise, toggle isOpen and change the icon accordingly
   * @param {MouseEvent} event - MouseEvent - the event that triggered the function.
   */
  checkOpeningRule(data: FavoriteData): void {
    data.isOpen = !data.isOpen;
    this.datas.forEach(item => {
      if(item.id != data.id) {
        item.isOpen=false;
      }
    })
  }

  async deleteFavorite(data: FavoriteData) {
    let removeData = Object.assign({}, data);
    removeData.isOpen = false;
    let index = this.datas.indexOf(data);
    this.datas.splice(index,1);

    const toast = await this.toastController.create({
      message: 'Votre favori \''+removeData.name+'\' a été supprimé',
      duration: 3000,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => { 'More Info clicked'; }
        },
        {
          icon: 'close',
          role: 'close',
          handler: () => { 'Dismiss clicked'; }
        }
      ]
    });

    await toast.present();

    const { role } = await toast.onDidDismiss();

    if (role === 'cancel') {
      this.datas.splice(index,0,removeData);
    } else {
      this.resetFilter();
    }
  }

  async renameFavorite(data: FavoriteData) {
    const alert = await this.alertController.create({
      header: 'Renommer le favori',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (alertData) => {
            for (let favorite of this.datas) {
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
            for (let favorite of this.datas) {
              if (favorite.name === data.name) {
                favorite.name = alertData.name
              }
            }
            data.name = alertData.name;
          }
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Intitulé du favoris',
          value: data.name
        },
      ],
    });

    await alert.present();
  }

}
