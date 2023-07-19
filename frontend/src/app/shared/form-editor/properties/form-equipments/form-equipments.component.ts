import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormDefinition } from '../../models/form.model';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-form-equipments',
  templateUrl: './form-equipments.component.html',
  styleUrls: ['./form-equipments.component.scss'],
})
export class FormEquipmentsComponent implements OnInit {
  constructor() {}

  @ViewChild('equipmentsModal') modal: IonModal;

  @Input() definition: FormDefinition;
  @Input() paramMap: Map<string, string>;
  public attributes: any;

  public equipments: string[];

  public isModalOpen: boolean;

  ngOnInit() {
    let equipments: string = this.paramMap.get('id');
    this.equipments = equipments.split(',');
  }

  public trackByFn(index: number, id: string): string {
    return id;
  }

  public onOpenModal(): void {
    this.modal.present();
  }
}