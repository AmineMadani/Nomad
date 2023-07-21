import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { WkoCreationComponent } from './wko-creation/wko-creation.component';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private location: Location,
    private drawer: DrawerService,
  ) {}

  @ViewChild('wkoCreation', { static: true }) public wkoCreation: WkoCreationComponent;

  public buttons: SynthesisButton[] = [
    { key: 'note', label: 'Compte-rendu', icon: 'reader' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'link' },
    { key: 'update', label: 'Mettre à jour', icon: 'pencil' },
  ];
  public editMode: boolean = false;
  public workOrder: any;
  public equipments: any[];

  public creationDisabled: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {}

  public onInitWorkorder(params: any): void {
    // Case creation
    if (this.activatedRoute.snapshot.params['id']) {
      this.workOrder = params;
    } else {
      this.equipments = Array.isArray(params) ? params : [params];
      this.buttons = [];
      this.editMode = true;
    }
  }

  /**
   * Action based on the button clicked
   * @param ev the buttons event
   */
  public onTabButtonClicked(ev: SynthesisButton): void {
    switch (ev.key) {
      case 'update':
        // Not implemented yet
        // this.editMode = !this.editMode;
        break;
      case 'note':
        this.drawer.navigateTo(DrawerRouteEnum.REPORT, [this.workOrder.id]);
        break;
      default:
        break;
    }
  }

  /**
   * Generate title for workorder drawer
   * @returns Title of the workorder drawer
   */
  public getTitle(): string {
    if (!this.workOrder && !this.equipments) {
      return null;
    }

    return this.workOrder
      ? 'I' + this.workOrder.id
      : 'Générer une intervention';
  }

  public onSubmit(): void {
    this.wkoCreation.workOrderForm.markAllAsTouched();
    if (this.wkoCreation.workOrderForm.valid) {
      this.wkoCreation.onSubmit();
    }
  }

  /**
   * Ask the user to cancel the workorder creation
   */
  public async onCancel() {
    const alert = await this.alertCtrl.create({
      header: `Souhaitez-vous vraiment annuler cette génération d’intervention ?`,
      buttons: [
        {
          text: 'Oui',
          role: 'confirm',
        },
        {
          text: 'Non',
          role: 'cancel',
        },
      ],
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.location.back();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
