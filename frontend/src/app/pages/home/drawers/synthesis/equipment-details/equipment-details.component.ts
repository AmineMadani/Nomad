import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';
import {
  Form,
  FormDefinition,
} from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-equipment-details',
  templateUrl: './equipment-details.component.html',
  styleUrls: ['./equipment-details.component.scss'],
})
export class EquipmentDetailsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private utils: UtilsService,
    private activatedRoute: ActivatedRoute
  ) {}

  public form: Form;
  public equipment: any;
  public type: string;

  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    this.activatedRoute.queryParams
      .pipe(
        switchMap((equipment: any) => {
          this.equipment = equipment;
          const type = equipment.layer.match(new RegExp(/(?<=(aep|ass)_)\w+/))![0];
          if (type) {
            this.type = type.charAt(0).toUpperCase() + type.slice(1);
          }
          return this.http.get<Form>(
            `./assets/mocks/equipment-details${
              this.isMobile ? '-mobile' : ''
            }.mock.json`
          );
        })
      )
      .subscribe((form: Form) => {
        form.definitions.map((def: FormDefinition) => {
          if (this.equipment[def.key]) {
            def.attributes.value = this.equipment[def.key];
          }
          return def;
        });
        this.form = form;
      });
  }
}