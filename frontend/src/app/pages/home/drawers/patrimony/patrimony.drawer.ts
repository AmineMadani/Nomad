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
    private mapService: MapService,
    private favService: FavoriteService
  ) { }

  @ViewChild('scrolling') scrolling: ElementRef;

  public filter: Filter = this.favService.getFilter();
  public currentSegment: FilterSegment | undefined;

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

  ngOnInit() {
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
    const currentFav: FavData | undefined = this.favService.getSelectedFavorite();
    if (currentFav) {
      let listIdFav: number[] | undefined = currentFav.equipments?.map(equ => equ.id);
      let listIdSelected: number[] | undefined = this.getFavData().map(equ => equ.id);
      return listIdFav && listIdFav.sort().join(',') !== listIdSelected.sort().join(',');
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

  async modifyFavorite(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Voulez-vous modifier le favori '+this.favService.getSelectedFavorite()?.name+' ?',
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
        currentFav.equipments = this.getFavData();
        this.favService.modifyCurrentFavorite(currentFav);
      }
    }
  }

  getFavData(): EqData[] {
    const eq: EqData[] = [];
    this.currentSegment?.components.forEach((c: FilterType) => {
      if (c.getType() === 'accordeonFilter') {
        c.data.forEach((acc: AccordeonData) => {
          if (acc.value) eq.push({ id: acc.id!, key: acc.key! });
          if (acc.children) {
            acc.children.forEach(child => {
              if (child.value) eq.push({ id: child.id!, key: child.key! });
            })
          }
        })
      }
    });
    return eq;
  }

  async addFavorite() {
    const eqFavs: FavData = {
      id: 0,
      position: 0,
      name: '',
      segment: this.currentSegment!.id,
      equipments: [],
    };
    const eq: EqData[] = [];
    this.currentSegment?.components.forEach((c: FilterType) => {
      if (c.getType() === 'accordeonFilter') {
        c.data.forEach((acc: AccordeonData) => {
          if (acc.value) eq.push({ id: acc.id!, key: acc.key! });
          if (acc.children) {
            acc.children.forEach(child => {
              if (child.value) eq.push({ id: child.id!, key: child.key! });
            })
          }
        })
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
        eqFavs.name = data.values.name;
        this.favService.addFavorite(eqFavs);
      }
    }
  }
}
