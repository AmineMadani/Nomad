import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { AccordeonData } from 'src/app/core/models/filter/filter-component-models/AccordeonFilter.model';
import { EqData } from 'src/app/core/models/filter/filter-component-models/FavoriteFilter.model';
import {
  FilterSegment,
  FilterType,
} from 'src/app/core/models/filter/filter-segment.model';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { Favorite, User } from 'src/app/core/models/user.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';
import { TemplateDataService } from 'src/app/core/services/dataservices/template.dataservice';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.drawer.html',
  styleUrls: ['./asset.drawer.scss'],
})
export class AssetDrawer implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private alertController: AlertController,
    private templateDataService: TemplateDataService,
    private assetFilterService: AssetFilterService,
    private userService: UserService,
  ) {
    this.templateDataService.getformsTemplate().then(forms => {
      this.assetFilterTree = JSON.parse(forms.find(form => form.formCode === 'ASSET_FILTER').definition);
      this.assetFilterService.setAssetFilter(this.assetFilterTree);
      this.assetFilterSegment = this.assetFilterService.getFilterSegment(this.assetFilterService.getAssetFilter());
      this.selectedSegment = this.assetFilterSegment[0].name;
    });

    this.userService.getUser().then(usr => this.user = usr);
  }

  @ViewChild('scrolling') scrolling: ElementRef;

  public assetFilterTree: FilterAsset[];
  public assetFilterSegment: FilterAsset[];
  public selectedSegment?: string;
  public user: User;

  public currentSegment: FilterSegment | undefined;
  private ngUnsubscribe: Subject<void> = new Subject();

  isMobile: boolean = false;

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public isModifyFavorite = () => {
    if (this.assetFilterService.selectedFavorite) {
      return this.selectedSegment === this.assetFilterService.selectedFavorite.segment;
    }
    return false;
  };

  public getTitle(): string {
    let val = 'Patrimoine';
    if (this.assetFilterService.selectedFavorite) {
      val += ' (' + this.assetFilterService.selectedFavorite.name + ')';
    }
    return val;
  }

  public isFavoriteDataChange = () => {
    if (this.isModifyFavorite()) {
      const selectedLayers = this.assetFilterService.getselectedLayer(this.assetFilterSegment.find(asset => asset.name == this.selectedSegment));
      if (selectedLayers.length != this.assetFilterService.selectedFavorite.layers.length) {
        return true;
      } else {
        if (selectedLayers.map(res => res.styleKey ? res.layerKey + res.styleKey : res.layerKey).sort().join("") !=
          this.assetFilterService.selectedFavorite.layers.map(res => res.styleKey ? res.layerKey + res.styleKey : res.layerKey).sort().join("")) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * This is an async function that displays an alert asking the user if they want to modify a selected
   * favorite, and if confirmed, updates the selected favorite with new equipment data.
   */
  public async onModifyFavorite(): Promise<void> {
    const alert = await this.alertController.create({
      header:
        'Voulez-vous modifier le favori ' +
        this.assetFilterService.selectedFavorite.name +
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
      this.assetFilterService.selectedFavorite.layers = [];
      let selectedSegment = this.assetFilterSegment.find(asset => asset.name == this.selectedSegment);
      let selectedAsset = this.assetFilterService.getselectedLayer(selectedSegment ? selectedSegment : undefined);
      for (let asset of selectedAsset) {
        this.assetFilterService.selectedFavorite.layers.push({
          layerKey: asset.layerKey,
          styleKey: asset.styleKey
        });
      }
      for (let fav of this.user.usrConfiguration.favorites) {
        if (fav.name == this.assetFilterService.selectedFavorite.name) {
          fav.layers = this.assetFilterService.selectedFavorite.layers;
          this.assetFilterService.selectedFavorite = fav;
          break;
        }
      }
      this.userService.setUser(this.user);
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
  public async onAddFavorite() {

    let newfavorite: Favorite = {
      name: "",
      layers: [],
      segment: this.selectedSegment
    }

    let existingFav: Favorite | undefined;
    let selectedSegment = this.assetFilterSegment.find(asset => asset.name == this.selectedSegment);
    let defaultfavoriteName = selectedSegment ? (selectedSegment.segmentName ? selectedSegment.segmentName : selectedSegment.name) : 'Détails'
    let selectedAsset = this.assetFilterService.getselectedLayer(selectedSegment ? selectedSegment : undefined);
    for (let asset of selectedAsset) {
      newfavorite.layers.push({
        layerKey: asset.layerKey,
        styleKey: asset.styleKey
      })
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
            newfavorite.name = data.name;
            existingFav = this.user.usrConfiguration.favorites.find((u) => u.name == data.name);
            if (existingFav) {
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
          value: `${defaultfavoriteName} - favoris - ${this.user.usrConfiguration.favorites?.length + 1}`,
        },
      ],
    });
    await alert.present();

    const { role, data } = await alert.onDidDismiss();
    if (role === 'confirm') {
      if (finalCreateConfirmation === true) {
        for (let fav of this.user.usrConfiguration.favorites) {
          if (fav.name == newfavorite.name) {
            fav.layers = newfavorite.layers;
            this.assetFilterService.selectedFavorite = fav;
            break;
          }
        }
        this.userService.setUser(this.user);
      } else if (finalCreateConfirmation === false) {
        this.onAddFavorite();
      } else {
        this.user.usrConfiguration.favorites.push(newfavorite);
        this.userService.setUser(this.user);
        this.assetFilterService.selectedFavorite = newfavorite;
      }
    }
  }

  /**
   * Updates the selected segment
   * @param {any} event - The event of the segment button
   */
  public onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  public onReset() {
    this.assetFilterService.reset();
  }

  public isFavoriteSegment(): boolean {
    return this.selectedSegment == 'favorite'
  };

  public isSelectedData(): boolean {
    if (this.assetFilterSegment) {
      return this.assetFilterService.hasSelectedItem();
    }
    return false;
  }

  public isSelectedDataOnSegment(): boolean {
    if (this.selectedSegment == "details") {
      return this.assetFilterService.hasSelectedItem();
    }
    if (this.selectedSegment == "favorite") {
      return false;
    }
    if (this.assetFilterSegment) {
      for (let segment of this.assetFilterSegment) {
        if (segment.name == this.selectedSegment) {
          return this.assetFilterService.hasSelectedItemOnSegment(segment);
        }
      }
    }
    return false;
  };

  onCustomScrollBarStyle(): string {
    return `
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: var(--ion-color-neutral-variant-80);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--ion-color-neutral-variant-30);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--ion-color-neutral-variant-50);
    }`;
  }
}
