import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { patrimonyFilterMock } from 'src/app/core/mocks/filter-patrimony.mock';
import { Favorite, favorites } from 'src/app/core/models/favorite.model';
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
    private mapService: MapService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  @ViewChild('scrolling') scrolling: ElementRef;

  favorites: Favorite[] = favorites;

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

  /*
  reset() {
    for (let segment of this.segments.entries()) {
      for (let data of segment[1].data) {
        this.deselectData(data);
      };
    };
    this.selectedFavorite = null;
  }

  isSelectedItem = () => {
    for (let entry of this.segments.entries()) {
      let segment = entry[1];
      for (let i = 0; i < segment.data.length; i++) {
        if (this.recursiveSelectedItem(segment.data[i])) {
          return true;
        }
      }
    }
    return false;
  }

  isSelectedItemOnSelectedSegment = () => {
    let segment = this.segments.get(this.selectedSegment);
    if (segment) {
      for (let i = 0; i < segment.data.length; i++) {
        if (this.recursiveSelectedItem(segment.data[i])) {
          return true;
        }
      }
    }
    return false;
  }

  isModifyFavorite = () => {
    if (this.selectedFavorite?.segmentParent === this.selectedSegment) {
      if (this.isSelectedItemOnSelectedSegment()) {
        return true;
      }
    }
    return false;
  }

  recursiveSelectedItem(item: AccordeonData): boolean {
    if (item.selected) {
      return true;
    }
    if (item.children) {
      for (let i = 0; i < item.children.length; i++) {
        if (this.recursiveSelectedItem(item.children[i])) {
          return true;
        }
      }
    }
    return false;
  }

  deselectData(data: AccordeonData) {
    data.selected = false;
    data.isInderminate = false;
    if (data.key.length > 0) this.mapService.removeEventLayer(data.key);
    let childs = data.children;
    if (childs) {
      for (let child of childs) {
        this.deselectData(child);
      };
    }
  }

  applyFavorite(name: string) {
    for (let favorite of favorites) {
      if (favorite.name === name) {
        for (let item of favorite.favoriteItems) {
          let segment = this.segments?.get(item.segment);
          if (segment) {
            for (let data of segment.data) {
              if (item.child && item.child.length > 0) {
                if (data.children?.length != data.children?.filter(el => el.selected).length) {
                  data.isInderminate = true;
                }
                for (let itemChild of item.child) {
                  if (data.children && data.children.length > 0) {
                    for (let child of data.children) {
                      if (child.name === itemChild) {
                        child.selected = true;
                        if (child.key.length > 0) this.mapService.addEventLayer(child.key);
                      }
                    }
                  }
                };
              } else {
                if (item.parent === data.name) {
                  data.selected = true;
                  if (data.key.length > 0) this.mapService.addEventLayer(data.key);
                  if (data.children && data.children.length > 0) {
                    for (let child of data.children) {
                      child.selected = true;
                      if (child.key.length > 0) this.mapService.addEventLayer(child.key);
                    }
                  }
                }
              }
            };
          }
        };
      }
    };
  }

  eventManager(accordeonSelection: AccordeonSelection) {
    if (accordeonSelection.type === "favorite") {
      if (accordeonSelection.action === 'select') {
        this.selectFavorite(accordeonSelection);
      }
      if (accordeonSelection.action === 'delete') {
        this.removeFavorite(accordeonSelection);
      }
      if (accordeonSelection.action === 'rename') {
        this.renameFavorite(accordeonSelection);
      }
    }
  }

  selectFavorite(accordeonSelection: AccordeonSelection) {
    if (accordeonSelection.data.selected) {
      this.reset();
      //TODO optim a revoir
      //Traitement trop rapide, necessité d'attendre la fin de l'affichage
      setTimeout(() => {
        this.applyFavorite(accordeonSelection.data.name);
        accordeonSelection.data.selected = true;
        this.selectedFavorite = accordeonSelection.data;
      })
    } else {
      if (this.isSelectedItem()) {
        this.reset();
      };
    }
  }

  removeFavorite(accordeonSelection: AccordeonSelection) {
    for (let segment of this.segments.entries()) {
      if (segment[1].type === 'favorite') {
        segment[1].data.forEach((data, index) => {
          if (data.name === accordeonSelection.data.name) {
            let removeData = Object.assign({}, data);
            segment[1].data.splice(index, 1);
            if (removeData.selected) {
              removeData.selected = false;
              this.reset();
            }
            this.deleteFavoriteToast(removeData, segment[1].data, index);
          }
        });
      }
    }
  }

  modifyFavorite() {
    let newFavorite: Favorite = {
      name: this.selectFavorite.name,
      favoriteItems: []
    };
    let initialFavorite;
    for (let favorite of this.favorites) {
      if (favorite.name === this.selectedFavorite?.name) {
        initialFavorite = Object.assign({}, favorite);
        if (this.selectedFavorite.segmentParent) {
          let segment = this.segments.get(this.selectedFavorite.segmentParent);
          if (segment && segment.saveableFavorite) {
            for (let data of segment.data) {
              this.recursiveSelectedModifyFavorite(data, this.selectedFavorite.segmentParent, newFavorite, false, []);
            }
          }
        }
        favorite.favoriteItems = newFavorite.favoriteItems;
        this.modifyFavoriteToast(favorite, initialFavorite);
      }
    }
  }

  recursiveSelectedModifyFavorite(item: AccordeonData, segment: string, favorites: Favorite, isChild: boolean, childs: string[]) {
    if (item.selected || item.isInderminate) {
      if (isChild) {
        childs.push(item.name);
      } else {
        favorites.favoriteItems.push({
          segment: segment,
          parent: item.name,
          child: childs
        });
      }
    }
    if (item.children && item.isInderminate) {
      for (let i = 0; i < item.children.length; i++) {
        this.recursiveSelectedModifyFavorite(item.children[i], segment, favorites, true, childs);
      }
    }
  }

  async modifyFavoriteToast(currentFavorite: Favorite, oldFavorite: Favorite) {
    const toast = await this.toastController.create({
      message: 'Votre favori a été modifié',
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
      currentFavorite.favoriteItems = oldFavorite.favoriteItems;
    }
  }

  async deleteFavoriteToast(removeData: AccordeonData, datas: AccordeonData[], index: number) {
    const toast = await this.toastController.create({
      message: 'Votre favori a été supprimé',
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
      datas.splice(index, 0, removeData);
    }
  }

  async renameFavorite(accordeonSelection: AccordeonSelection) {
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
            for (let favorite of this.favorites) {
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
            for (let favorite of this.favorites) {
              if (favorite.name === accordeonSelection.data.name) {
                favorite.name = alertData.name
              }
            }
            accordeonSelection.data.name = alertData.name;
          }
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Intitulé du favoris',
          value: accordeonSelection.data.name
        },
      ],
    });

    await alert.present();
  }

  constructFavorite(name: string): Favorite {
    let newFavorite: Favorite = {
      name: name,
      favoriteItems: []
    };
    let segment = this.segments.get(this.selectedSegment);
    if (segment && segment.saveableFavorite) {
      for (let data of segment.data) {
        this.recursiveConstructFavorite(data, this.selectedSegment, newFavorite, false, []);
      }
    }

    return newFavorite;
  }

  recursiveConstructFavorite(item: AccordeonData, segment: string, favorites: Favorite, isChild: boolean, childs: string[]) {
    if (item.selected || item.isInderminate) {
      if (isChild) {
        childs.push(item.name);
      } else {
        favorites.favoriteItems.push({
          segment: segment,
          parent: item.name,
          child: childs
        });
      }
    }
    if (item.children && item.isInderminate) {
      for (let i = 0; i < item.children.length; i++) {
        this.recursiveSelectedModifyFavorite(item.children[i], segment, favorites, true, childs);
      }
    }
  }

  async addFavorite() {
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
            for (let favorite of this.favorites) {
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

            console.log(alertData.name);

            let segment = this.segments.get('favorites');
            if (segment) {
              for (let data of segment.data) {
                data.selected = false;
              }

              let accordeonData: AccordeonData = {
                name: alertData.name,
                imgSrc: '',
                key: '',
                children: [],
                segmentParent: this.selectedSegment,
                selected: true,
                isInderminate: false
              };

              segment.data.push(accordeonData);
              this.favorites.push(this.constructFavorite(alertData.name));
              this.selectedFavorite = accordeonData;
            }
          }
        },
      ],
      inputs: [
        {
          name: 'name',
          placeholder: 'Intitulé du favoris'
        },
      ],
    });

    await alert.present();
  }*/
}
