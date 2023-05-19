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
  selector: 'app-demande',
  templateUrl: './demande.drawer.html',
  styleUrls: ['./demande.drawer.scss'],
})
export class DemandeDrawer implements OnInit {
  constructor(
    private router: ActivatedRoute,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((params) => {
        this.demande = MapFeature.from(params);
        this.createForm();
      });
  }

  public buttons: SynthesisButton[] = [
    { key: 'note', label: 'Compte-rendu', icon: 'reader' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'link' },
    { key: 'update', label: 'Mettre à jour', icon: 'pencil' },
  ];
  public demande: MapFeature;
  public demandeForm: Form;

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

  createForm(): void {
    this.http
      .get<Form>('./assets/mocks/demande.mock.json')
      .subscribe((demForm: Form) => {
        demForm.definitions.map((def: FormDefinition) => {
          if (this.demande[def.key]) {
            def.attributes.value = this.demande[def.key];
          } else {
            if (def.key === 'date') {
              def.attributes.value = `${this.datePipe.transform(
                this.demande.datebegin,
                'dd/MM/yyyy'
              )} - ${this.datePipe.transform(
                this.demande.dateend,
                'dd/MM/yyyy'
              )}`;
            } else if (def.key === 'urgence') {
              def.attributes.value = this.demande.urgent ? 'Urgent' : def.attributes.default;
            } 
            else if (def.attributes.default) {
              def.attributes.value = def.attributes.default;
            }
          }
          return def;
        });
        this.demandeForm = demForm;
      });
  }
}
