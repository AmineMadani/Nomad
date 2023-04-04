import { Component, OnInit, Input } from '@angular/core';
import Feature from 'ol/Feature';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import {
  InterventionData,
  InterventionFilter,
  InterventionStatusEnum,
} from 'src/app/core/models/filter/filter-component-models/InterventionFilter.model';
import { FilterType } from 'src/app/core/models/filter/filter-segment.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';

@Component({
  selector: 'app-filter-intervention',
  templateUrl: './filter-intervention.component.html',
  styleUrls: ['./filter-intervention.component.scss'],
})
export class FilterInterventionComponent implements OnInit {
  constructor(private layerService: LayerService, private drawer: DrawerService) {}

  @Input() data: FilterType;

  ngOnInit() {
    this.data = this.data as InterventionFilter;
  }

  public highlightFeature(featureId: string): void {
    this.layerService.highlightFeature((this.data as InterventionFilter).type, featureId);
  }

  public getFeatures(): Feature[] {
    // Should swap if maxZoom > currentZoom & if toggle active or not
    return this.layerService.getFeaturesInView((this.data as InterventionFilter).type);
  }

  public openFeature(featureId: string): void {
    // Need to check intervention or demande later
    const feature: Feature = this.layerService.getFeatureById('intervention', featureId)!;
    this.drawer.navigateTo(
      DrawerRouteEnum.INTERVENTION,
      [featureId],
      feature.getProperties()
    )
  }

  public getStatusIcon(status: InterventionStatusEnum): string {
    switch (status) {
      case InterventionStatusEnum.NF:
        return 'checkmark';
      case InterventionStatusEnum.I:
        return 'close';
      case InterventionStatusEnum.P:
      case InterventionStatusEnum.NP:
        return 'calendar';
      case InterventionStatusEnum.T:
        return 'checkmark-done'
      default:
        return '';
    }
  }

  public getStatusLabel(status: InterventionStatusEnum): string {
    switch (status) {
      case InterventionStatusEnum.NF:
        return 'Non fait';
      case InterventionStatusEnum.I:
        return 'Infructueuse';
      case InterventionStatusEnum.P:
        return 'Planifiée';
      case InterventionStatusEnum.NP:
        return 'Non Planifiée';
      case InterventionStatusEnum.T:
        return 'Terminée'
      default:
        return '';
    }
  }
}
