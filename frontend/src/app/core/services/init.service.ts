import { Injectable } from '@angular/core';
import { LayerService } from './layer.service';
import { Observable, forkJoin } from 'rxjs';
import { UserService } from './user.service';
import { ContractService } from './contract.service';
import { CityService } from './city.service';
import { WorkorderService } from './workorder.service';
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(
    private userService: UserService,
    private contractService: ContractService,
    private cityService: CityService,
    private layerService: LayerService,
    private workorderService: WorkorderService,
    private templateService: TemplateService
  ) { }

  /**
 * Retrieves initial data.
 * @returns A promise that resolves to a boolean indicating if the operation completed successfully.
 */
  getInitDataForMobile(): Observable<any> {
    return forkJoin({
      contracts: this.contractService.getAllContracts(),
      cities: this.cityService.getAllCities(),
      layers: this.layerService.getAllLayers(),
      vLayerWtrs: this.layerService.getAllVLayerWtr(),
      layerIndexes: this.layerService.getLayerIndexes(),
      workTaskStatus: this.workorderService.getAllWorkorderTaskStatus(),
      workTaskReasons: this.workorderService.getAllWorkorderTaskReasons(),
      permissions: this.userService.getAllPermissions(),
      formTemplates: this.templateService.getFormsTemplate(),
      layerReferences: this.layerService.getUserLayerReferences()
    });
  }

  getInitDataForWeb(): void {
    forkJoin({
      permissions: this.userService.getAllPermissions(),
      layerReferences: this.layerService.getUserLayerReferences()
    }).subscribe();
  }
}
