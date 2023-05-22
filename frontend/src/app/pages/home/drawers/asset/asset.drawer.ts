import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AccordeonData } from 'src/app/core/models/filter/filter-component-models/AccordeonFilter.model';
import { EqData, FavData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import {
  FilterSegment,
  FilterType,
} from 'src/app/core/models/filter/filter-segment.model';
import { Filter } from 'src/app/core/models/filter/filter.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FavoriteService } from 'src/app/core/services/favorite.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.drawer.html',
  styleUrls: ['./asset.drawer.scss'],
})
export class AssetDrawer implements OnInit {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private alertController: AlertController,
    private mapService: MapService,
    private favService: FavoriteService
  ) {}

  @ViewChild('scrolling') scrolling: ElementRef;

  public filter: Filter = this.favService.getFilter();
  public currentSegment: FilterSegment | undefined;

  isMobile: boolean = false;

  title(): string {
    let val = 'Patrimoine';
    if (this.favService.getSelectedFavorite()) {
      val += ' (' + this.favService.getSelectedFavorite()?.name + ')';
    }
    return val;
  }

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

  asIsOrder(a: any, b: any) {
    return a.value.position - b.value.position;
  }

  onSegmentChange(segment: number): void {
    this.currentSegment = this.filter.segments.find(
      (seg: FilterSegment) => seg.id === segment
    );
  }

  isFavoriteSegment = () => {
    return this.filter.segments.some(
      (segment) =>
        segment.selected &&
        segment.components.some(
          (component) => component.getType() === 'favoriteFilter'
        )
    );
  };

  isModifyFavorite = () => {
    const currentFav: FavData | undefined =
      this.favService.getSelectedFavorite();
    if (currentFav) {
      return currentFav.segment === this.currentSegment?.id;
    }
    return false;
  };

  isSelectedDataOnSegment = () => {
    return this.filter.segments.some(
      (segment) =>
        segment.selected &&
        segment.components.some((component) => component.isSelectedData())
    );
  };

  isSelectedData = () => {
    return this.filter.segments.some((segment) =>
      segment.components.some((component) => component.isSelectedData())
    );
  };

  isFavoriteDataChange = () => {
    const currentFav: FavData | undefined =
      this.favService.getSelectedFavorite();
    if (currentFav) {
      let listIdFav: number[] | undefined = currentFav.equipments?.map(
        (equ) => equ.id
      );
      let listIdSelected: number[] | undefined = this.getFavoriteData().map(
        (equ) => equ.id
      );
      return (
        listIdFav &&
        listIdFav.sort().join(',') !== listIdSelected.sort().join(',')
      );
    }
    return false;
  };

  reset() {
    this.filter.segments.forEach((segment) => {
      segment.components.forEach((component) => {
        component.reset();
      });
    });
    this.mapService.resetLayers();
    this.favService.removeCurrentFavorite();
  }

  /**
   * This is an async function that displays an alert asking the user if they want to modify a selected
   * favorite, and if confirmed, updates the selected favorite with new equipment data.
   */
  async modifyFavorite(): Promise<void> {
    const alert = await this.alertController.create({
      header:
        'Voulez-vous modifier le favori ' +
        this.favService.getSelectedFavorite()?.name +
        ' ?',
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
      const currentFav: FavData | undefined =
        this.favService.getSelectedFavorite();
      if (currentFav) {
        currentFav.equipments = this.getFavoriteData();
        this.favService.modifyCurrentFavorite(currentFav);
      }
    }
  }

  getFavoriteData(): EqData[] {
    const eq: EqData[] = [];
    this.currentSegment?.components.forEach((c: FilterType) => {
      if (c.getType() === 'accordeonFilter') {
        c.data.forEach((acc: AccordeonData) => {
          if (acc.value) eq.push({ id: acc.id!, key: acc.key! });
          if (acc.children) {
            acc.children.forEach((child) => {
              if (child.value) eq.push({ id: child.id!, key: child.key! });
            });
          }
        });
      }
    });
    return eq;
  }

  /**
   * Adds a new favorite to a list of favorites, with the option to modify an existing
   * favorite if a duplicate name is found.
   */
  async addFavorite() {
    const eqFavs: FavData = {
      id: 0,
      position: 0,
      name: '',
      segment: this.currentSegment!.id,
      equipments: [],
    };
    const eq: EqData[] = [];
    let existingFav: FavData | undefined;
    this.currentSegment?.components.forEach((c: FilterType) => {
      if (c.getType() === 'accordeonFilter') {
        c.data.forEach((acc: AccordeonData) => {
          if (acc.value) eq.push({ id: acc.id!, key: acc.key! });
          if (acc.children) {
            acc.children.forEach((child) => {
              if (child.value) eq.push({ id: child.id!, key: child.key! });
            });
          }
        });
      }
    });
    eqFavs.equipments = eq;
    if (eqFavs.equipments && eqFavs.equipments.length > 0) {
      const exisingFavs: FavData[] = this.favService.getFavList(
        eqFavs.segment!
      );

      let n = 1;
      let defaultName: string = `${this.currentSegment?.name} - favoris - ${n}`;
      while (exisingFavs.map((f) => f.name).includes(defaultName)) {
        n += 1;
        defaultName = `${this.currentSegment?.name} - favoris - ${n}`;
      }
      let finalCreateConfirmation: boolean | null = null;
      const alert = await this.alertController.create({
        header: "Création d'un nouveau favori",
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Ok',
            role: 'confirm',
            handler: async (data) => {
              let favorites = this.favService.getAllFavList();
              existingFav = favorites.find((u) => u.name == data.name);
              let isDuplicate = existingFav !== undefined;
              isDuplicate = favorites.some((u) => u.name == data.name);
              if (isDuplicate) {
                const alertDoublon = await this.alertController.create({
                  header:
                    'Il existe un favori du même nom. Voulez-vous le remplacer  ?',
                  buttons: [
                    {
                      text: 'Non',
                      role: 'cancel',
                    },
                    {
                      text: 'Oui',
                      role: 'confirm',
                    },
                  ],
                });
                await alertDoublon.present();
                const { role, data } = await alertDoublon.onDidDismiss();
                if (role === 'confirm') {
                  finalCreateConfirmation = true;
                } else {
                  finalCreateConfirmation = false;
                  return;
                }
              }
            },
          },
        ],
        inputs: [
          {
            name: 'name',
            placeholder: 'Nom du favori',
            value: defaultName,
          },
        ],
      });
      await alert.present();

      const { role, data } = await alert.onDidDismiss();
      if (role === 'confirm') {
        if (finalCreateConfirmation === true) {
          existingFav.equipments = eqFavs.equipments;
          this.favService.modifyCurrentFavorite(existingFav);
        } else if (finalCreateConfirmation === false) {
          this.addFavorite();
        } else {
          eqFavs.name = data.values.name;
          this.favService.addFavorite(eqFavs);
        }
      }
    }
  }
}
