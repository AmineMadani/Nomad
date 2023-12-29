import {
  Component,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { City, getCityLabel } from 'src/app/core/models/city.model';
import { Contract, getContractLabel } from 'src/app/core/models/contract.model';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { GeographicalTypeEnum, SearchEquipments } from 'src/app/core/models/layer.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { TemplateService } from 'src/app/core/services/template.service';

@Component({
  selector: 'app-geographical-selection',
  templateUrl: './geographical-selection.drawer.html',
  styleUrls: ['./geographical-selection.drawer.scss'],
})
export class GeographicalSelectionDrawer implements OnInit {
  constructor(
    private cityService: CityService,
    private contractService: ContractService,
    private templateService: TemplateService,
    private assetFilterService: AssetFilterService,
    private filterService: FilterService,
    private layerService: LayerService,
    private mapService: MapService,
    private drawerService: DrawerService
  ) { }

  public geographicalSelectionForm: FormGroup;
  public geographicalTypes = [
    {
      id: GeographicalTypeEnum.CONTRACT,
      label: 'Contrat',
    },
    {
      id: GeographicalTypeEnum.CITY,
      label: 'Commune',
    },
  ];
  public getGeographicalTypeLabel(geographicalType): string {
    return geographicalType.label;
  }
  public GeographicalTypeEnum = GeographicalTypeEnum;

  public cities: City[] = [];
  public getCityLabel = getCityLabel;

  public contracts: Contract[] = [];
  public getContractLabel = getContractLabel;

  public assetFilterTree: FilterAsset[];

  public isLoading: boolean = true;
  public formValueChanges$ = new Subject<void>();

  async ngOnInit() {
    this.isLoading = true;

    this.initForm();

    await this.initData();

    this.isLoading = false;
  }

  private async initData() {
    const results = await Promise.all([
      this.templateService.getFormsTemplate(),
      this.contractService.getAllContracts(),
      this.cityService.getAllCities(),
      this.layerService.getUserLayerReferences()
    ]);
    const forms = results[0];
    const contracts = results[1];
    const cities = results[2];
    const layerReferences = results[3];

    // Asset tree
    const assetFilterTree = JSON.parse(
      forms.find((form) => form.formCode === 'ASSET_FILTER').definition
    );
    this.assetFilterTree = this.templateService.removeAssetNotVisible(assetFilterTree);
    this.assetFilterService.setAssetFilter('home', this.assetFilterTree);
    const assetFilterSegment = this.assetFilterService.getFilterSegment(
      this.assetFilterService.getAssetFilter()
    );

    for (const filterSegment of assetFilterSegment) {
      if (filterSegment.customFilter) {
        let segmentLayers: string[] = this.assetFilterService.getSegmentLayers(filterSegment);
        for (const customFilter of filterSegment.customFilter) {
          const layers = layerReferences
            .filter(
              (layerReference) => segmentLayers.includes(layerReference.layerKey) &&
                layerReference.references.some(
                  (x) => x.referenceKey == customFilter.key
                )
            )
            ?.map((layer) => layer.layerKey);
          this.filterService.setToggleFilter('home', layers, customFilter.key, customFilter.value, customFilter.checked);
        }
      }
    }

    // Contracts
    this.contracts = contracts;
    // Cities
    this.cities = cities;
  }

  private initForm() {
    this.geographicalSelectionForm = new FormGroup({
      geographicalTypeId: new FormControl(null, [Validators.required]),
      listCtyId: new FormControl(null),
      listCtrId: new FormControl(null),
    });

    this.geographicalSelectionForm.get('geographicalTypeId').valueChanges
      .pipe(
        takeUntil(this.formValueChanges$)
      )
      .subscribe((geographicalTypeId: GeographicalTypeEnum) => {
        const listCtyIdControl = this.geographicalSelectionForm.get('listCtyId');
        const listCtrIdControl = this.geographicalSelectionForm.get('listCtrId');

        if (geographicalTypeId === GeographicalTypeEnum.CITY) {
          listCtyIdControl.setValidators([Validators.required]);
          listCtrIdControl.clearValidators();
        } else if (geographicalTypeId === GeographicalTypeEnum.CONTRACT) {
          listCtrIdControl.setValidators([Validators.required]);
          listCtyIdControl.clearValidators();
        }

        listCtyIdControl.updateValueAndValidity();
        listCtrIdControl.updateValueAndValidity();
      });
  }

  public async onSubmit() {
    // Check if all required values filled
    if (this.geographicalSelectionForm.valid) {
      this.isLoading = true;

      // Get layers on the map
      const layers = this.mapService.getCurrentLayers();
      const layerKeys = Array.from(layers.keys()).filter((key) => key !== 'task');
      // Get assets from contract or city
      let filterIds = [];
      const filterType = this.geographicalSelectionForm.get('geographicalTypeId').value;
      switch (filterType) {
        case GeographicalTypeEnum.CONTRACT:
          filterIds = this.geographicalSelectionForm.get('listCtrId').value;
          break;
        case GeographicalTypeEnum.CITY:
          filterIds = this.geographicalSelectionForm.get('listCtyId').value;
          break;
      }
      const searchAssets: SearchEquipments[] = await this.layerService.getAssetIdsByLayersAndFilterIds(
        layerKeys,
        filterIds,
        filterType
      );

      // Go to the multi selection
      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        searchAssets
      );

      this.isLoading = false;
    } else {
      this.geographicalSelectionForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.formValueChanges$.complete();
  }
}
