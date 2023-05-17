import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute } from '@angular/router';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { HttpClient } from '@angular/common/http';
import {
  Form,
  FormDefinition,
} from 'src/app/shared/form-editor/models/form.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.drawer.html',
  styleUrls: ['./work-order.drawer.scss'],
})
export class WorkOrderDrawer implements OnInit, OnDestroy {
  constructor(
    private router: ActivatedRoute,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params) => {
        this.workOrder = MapFeature.from(params);
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

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  // Security while still using Ion Router
  ionViewWillLeave(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public createForm(): void {
    this.http
      .get<Form>('./assets/mocks/work-order.mock.json')
      .subscribe((woForm: Form) => {
        woForm.definitions.map((def: FormDefinition) => {
          if (this.workOrder[def.key]) {
            def.attributes.value = this.workOrder[def.key];
          } else {
            if (def.key === 'date') {
              def.attributes.value = `${this.datePipe.transform(
                this.workOrder.datebegin,
                'dd/MM/yyyy'
              )} - ${this.datePipe.transform(
                this.workOrder.dateend,
                'dd/MM/yyyy'
              )}`;
            } else if (def.attributes.default) {
              def.attributes.value = def.attributes.default;
            }
          }
          return def;
        });
        this.workOrderForm = woForm;
      });
  }

  public onTabButtonClicked(ev: SynthesisButton): void {
    switch(ev.key) {
      case 'update':
        this.editMode = !this.editMode;
        break;
      default:
        break;
    }
  }
}
