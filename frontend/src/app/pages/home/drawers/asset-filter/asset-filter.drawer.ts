import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import {
  CustomFilter,
  FilterAsset,
} from 'src/app/core/models/filter/filter.model';
import { Layer, LayerReferences } from 'src/app/core/models/layer.model';
import { Favorite, User } from 'src/app/core/models/user.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-asset-filter',
  templateUrl: './asset-filter.drawer.html',
  styleUrls: ['./asset-filter.drawer.scss'],
})
export class AssetFilterDrawer implements OnInit, OnDestroy {
  constructor(
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private alertController: AlertController,
    private templateService: TemplateService,
    private assetFilterService: AssetFilterService,
    private userService: UserService,
    private filterService: FilterService,
    private layerService: LayerService
  ) {}

  @ViewChild('scrolling') scrolling: ElementRef;

  public assetFilterSegment: FilterAsset[];
  public selectedSegment?: string;
  public assetFilterTree: FilterAsset[];
  public isMobile: boolean = false;
  public isLoading: boolean = true;
  public user: User;
  public layerReferences: LayerReferences[];

  private ngUnsubscribe: Subject<void> = new Subject();

  async ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    this.isLoading = true;


    this.user = await this.userService.getCurrentUser();

    // Get all layer references of the user
    this.layerService
      .getUserLayerReferences()
      .then((layerReferences) => (this.layerReferences = layerReferences));

    this.templateService.getFormsTemplate().then((forms) => {
      const assetFilterTree = JSON.parse(
        forms.find((form) => form.formCode === 'ASSET_FILTER').definition
      );
      this.assetFilterTree = this.templateService.removeAssetNotVisible(assetFilterTree);
      this.assetFilterService.setAssetFilter('home', this.assetFilterTree);
      this.assetFilterSegment = this.assetFilterService.getFilterSegment(
        this.assetFilterService.getAssetFilter()
      );
      if (this.user.usrConfiguration?.context?.lastDrawerSegment) {
        this.selectedSegment = this.user.usrConfiguration.context.lastDrawerSegment;
      } else {
        this.selectedSegment = this.assetFilterSegment[0]?.name ?? 'favorite';
      }
      this.isLoading = false;

      for (const filterSegment of this.assetFilterSegment) {
        if (filterSegment.customFilter) {
          let segmentLayers: string[] = this.assetFilterService.getSegmentLayers(filterSegment);
          for (const customFilter of filterSegment.customFilter) {
            const layers = this.layerReferences
              .filter(
                (layerReference) =>
                  segmentLayers.includes(layerReference.layerKey) &&
                  layerReference.references.some(
                    (x) => x.referenceKey == customFilter.key
                  )
              )
              ?.map((layer) => layer.layerKey);
            this.filterService.setToggleFilter('home', layers, customFilter.key, customFilter.value, customFilter.checked);
          }
        }
      }
    });

    this.userService.getCurrentUser().then(usr => this.user = usr);
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Check if the favorite is on the right segment
   * @returns True if the favorite is on the current segment
   */
  public isModifyFavorite = () => {
    if (this.assetFilterService.selectedFavorite) {
      return (
        this.selectedSegment ===
        this.assetFilterService.selectedFavorite.segment
      );
    }
    return false;
  };

  /**
   * Get the title
   * @returns Formatted title
   */
  public getTitle(): string {
    let val = 'Patrimoine';
    if (this.assetFilterService.selectedFavorite) {
      val += ' (' + this.assetFilterService.selectedFavorite.name + ')';
    }
    return val;
  }

  /**
   * Check if favorite data change
   * @returns true if favorite data change
   */
  public isFavoriteDataChange = () => {
    if (this.isModifyFavorite()) {
      const selectedLayers = this.assetFilterService.getselectedLayer(
        this.assetFilterSegment.find(
          (asset) => asset.name == this.selectedSegment
        )
      );
      if (
        selectedLayers.length !=
        this.assetFilterService.selectedFavorite.layers.length
      ) {
        return true;
      } else {
        if (
          selectedLayers
            .map((res) =>
              res.styleKey ? res.layerKey + res.styleKey : res.layerKey
            )
            .sort()
            .join('') !=
          this.assetFilterService.selectedFavorite.layers
            .map((res) =>
              res.styleKey ? res.layerKey + res.styleKey : res.layerKey
            )
            .sort()
            .join('')
        ) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Toggle custom filter on a specific segment
   * @param segment the segment to filter
   * @param customFilter  the custom filter
   * @param e the event
   */
  public onToggleChange(
    segment: FilterAsset,
    customFilter: CustomFilter,
    e: Event
  ) {
    customFilter.checked = (e as CustomEvent).detail.checked;
    let selectedLayers: FilterAsset[] =
      this.assetFilterService.getselectedLayer(segment);
    let layers: string[] = selectedLayers
      .filter((filter) => !filter.styleKey)
      .map((filter) => filter.layerKey);
    layers = layers.filter((item, index) => layers.indexOf(item) === index);
    this.filterService.setToggleFilter(
      'home',
      layers,
      customFilter.key,
      customFilter.value,
      customFilter.checked
    );
  }

  /**
   * Updates the selected segment
   * @param {any} event - The event of the segment button
   */
  public async onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    await this.userService.setLastSelectedDrawer(event.detail.value);
    this.userService.saveUserContext();
  }

  /**
   * Reset all the layers
   */
  public onReset() {
    this.assetFilterService.reset();
  }

  /**
   * Check if is the favorite segment
   * @returns True if favorite segment
   */
  public isFavoriteSegment(): boolean {
    return this.selectedSegment == 'favorite';
  }

  /**
   * Check if data selected
   */
  public isSelectedData(): boolean {
    if (this.assetFilterSegment) {
      return this.assetFilterService.hasSelectedItem();
    }
    return false;
  }

  /**
   * Check if data selected on a segment
   * @returns
   */
  public isSelectedDataOnSegment(): boolean {
    if (this.selectedSegment == 'details') {
      return this.assetFilterService.hasSelectedItem();
    }
    if (this.selectedSegment == 'favorite') {
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
  }

  /**
   * This is an async function that displays an alert asking the user if they want to modify a selected
   * favorite, and if confirmed, updates the selected favorite with new asset data.
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
      let selectedSegment = this.assetFilterSegment.find(
        (asset) => asset.name == this.selectedSegment
      );
      let selectedAsset = this.assetFilterService.getselectedLayer(
        selectedSegment ? selectedSegment : undefined
      );
      for (let asset of selectedAsset) {
        this.assetFilterService.selectedFavorite.layers.push({
          layerKey: asset.layerKey,
          styleKey: asset.styleKey,
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

  /**
   * Adds a new favorite to a list of favorites, with the option to modify an existing
   * favorite if a duplicate name is found.
   */
  public async onAddFavorite() {
    let newfavorite: Favorite = {
      name: '',
      layers: [],
      segment: this.selectedSegment,
    };

    let existingFav: Favorite | undefined;
    let selectedSegment = this.assetFilterSegment.find(
      (asset) => asset.name == this.selectedSegment
    );
    let defaultfavoriteName = selectedSegment
      ? selectedSegment.segmentName
        ? selectedSegment.segmentName
        : selectedSegment.name
      : 'Détails';
    let selectedAsset = this.assetFilterService.getselectedLayer(
      selectedSegment ? selectedSegment : undefined
    );
    for (let asset of selectedAsset) {
      newfavorite.layers.push({
        layerKey: asset.layerKey,
        styleKey: asset.styleKey,
      });
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
            existingFav = this.user.usrConfiguration.favorites.find(
              (u) => u.name == data.name
            );
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
          value: `${defaultfavoriteName} - favoris - ${
            this.user.usrConfiguration.favorites?.length + 1
          }`,
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
