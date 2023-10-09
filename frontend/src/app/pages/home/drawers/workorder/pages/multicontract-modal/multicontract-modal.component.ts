import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Contract } from 'src/app/core/models/contract.model';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-multicontract-modal',
  templateUrl: './multicontract-modal.component.html',
  styleUrls: ['./multicontract-modal.component.scss'],
})
export class MulticontractModalComponent implements OnInit {
  constructor(private modalCtrl: ModalController, private utils: UtilsService) {}

  public isMobile: boolean;
  public contracts: Contract[];
  public assets: any[];

  public contractSelected: Contract;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public editEquipmentList(): void {
    this.modalCtrl.dismiss(null);
  }

  public confirmContract(): void {
    this.modalCtrl.dismiss(this.contractSelected);
  }

  public getNumberOfAssetsPerContract(contract: Contract): number {
    return this.assets.filter((a) => a.ctrId === contract.id).length ?? 0;
  }
}
