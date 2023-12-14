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
import { SearchEquipments } from 'src/app/core/models/layer.model';
import { AssetFilterService } from 'src/app/core/services/assetFilter.service';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { FilterService } from 'src/app/core/services/filter.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { TemplateService } from 'src/app/core/services/template.service';

export enum GeographicalTypeEnum {
  CONTRACT = 1,
  CITY = 2
}

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

  public isLoading: boolean = false;
  public formValueChanges$ = new Subject<void>();

  async ngOnInit() {
    this.geographicalSelectionForm = new FormGroup({
      geographicalTypeId: new FormControl(null, [Validators.required]),
      listCtyId: new FormControl(null),
      listCtrId: new FormControl(null),
    });

    this.geographicalSelectionForm.get('geographicalTypeId').valueChanges
      .pipe(
        takeUntil(this.formValueChanges$),
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

    this.isLoading = true;

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

    console.log(forms);

    // Asset tree
    const assetFilterTree = JSON.parse(
      forms.find((form) => form.formCode === 'ASSET_FILTER').definition
    );
    this.assetFilterTree = this.templateService.removeAssetNotVisible(assetFilterTree);
    this.assetFilterService.setAssetFilter(this.assetFilterTree);
    const assetFilterSegment = this.assetFilterService.getFilterSegment(
      this.assetFilterService.getAssetFilter()
    );

    for (const filterSegment of assetFilterSegment) {
      if (filterSegment.customFilter) {
        let segmentLayers: string[] = this.assetFilterService.getSegmentLayers(filterSegment);
        for (const customFilter of filterSegment.customFilter) {
          const layers = layerReferences
            .filter(
              (layerReference) =>
                segmentLayers.includes(layerReference.layerKey) &&
                layerReference.references.some(
                  (x) => x.referenceKey == customFilter.key
                )
            )
            ?.map((layer) => layer.layerKey);
          this.filterService.setToggleFilter(layers, customFilter.key, customFilter.value, customFilter.checked);
        }
      }
    }

    // Contracts
    this.contracts = contracts;
    // Cities
    this.cities = cities;

    this.isLoading = false;
  }

  public async onSubmit() {
    // Check if all required values filled
    if (this.geographicalSelectionForm.valid) {
      const layers = this.mapService.getCurrentLayers();

      const searchAssets: SearchEquipments[] = [];

      for (const [key] of layers) {
        if (key !== 'task') {
          // Get assets from city or contract
          let assetIds: string[] = [];
          switch (this.geographicalSelectionForm.get('geographicalTypeId').value) {
            case GeographicalTypeEnum.CONTRACT:
              assetIds = await this.layerService.getAssetIdsByLayerAndListCtrId(
                key,
                this.geographicalSelectionForm.get('listCtrId').value
              );
              break;
            case GeographicalTypeEnum.CITY:
              assetIds = await this.layerService.getAssetIdsByLayerAndListCtyId(
                key,
                this.geographicalSelectionForm.get('listCtyId').value
              );
              break;
          }

          if (assetIds.length > 0) {
            searchAssets.push({
              lyrTableName: key,
              equipmentIds: assetIds,
            });
          }
        }
      }

      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        searchAssets
      );
    } else {
      this.geographicalSelectionForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.formValueChanges$.complete();
  }
}
