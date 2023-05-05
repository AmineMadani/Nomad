import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute } from '@angular/router';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { HttpClient } from '@angular/common/http';
import { Form } from 'src/app/shared/form-editor/models/form.model';
import { FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {
  constructor(
    private router: ActivatedRoute,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private location: Location
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.workOrder = MapFeature.from(params);
        this.workOrder.id = this.router.snapshot.paramMap.get('id');
        if(!this.workOrder?.id) {
          this.buttons = [];
        }
        this.createForm();
      });
  }

  public buttons: SynthesisButton[] = [
    { key: 'share', label: 'Partager', icon: 'share-social' },
    { key: 'print', label: 'Imprimer', icon: 'print' },
    { key: 'update', label: 'Mettre à jour', icon: 'pencil' },
  ];
  public workOrder: MapFeature;
  public workOrderForm: Form;

  public editMode: boolean = false;

  private ngUnsubscribe: Subject<void> = new Subject();

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Security while still using Ion Router
  ionViewWillLeave(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public createForm(): void {
    let form = 'work-order.mock.json';
    if(!this.workOrder.id){
      form = 'work-order-create.mock.json';
      this.editMode = true;
    }
    this.http
      .get<Form>('./assets/mocks/'+form)
      .subscribe((woForm: Form) => {
        this.workOrderForm = woForm;
      });
  }

  public onTabButtonClicked(ev: SynthesisButton): void {
    console.log(ev);
    switch(ev.key) {
      case 'update':
        this.editMode = !this.editMode;
        break;
      default:
        break;
    }
  }

  /**
   * Generate title for workorder drawer
   * @returns Title of the workorder drawer
   */
  getTitle(): string {
    return this.workOrder?.id ? 'I'+this.workOrder.id : 'Générer une intervention';
  }

  onSubmit(form:FormGroup){
    console.log(form);
    form.markAllAsTouched();
  }

  async onCancel(){
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
      ]
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.location.back();
    }
  }
}
