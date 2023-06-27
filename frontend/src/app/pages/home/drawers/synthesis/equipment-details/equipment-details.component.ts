import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { TemplateForm } from 'src/app/core/models/template.model';
import { TemplateDataService } from 'src/app/core/services/dataservices/template.dataservice';
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
    private activatedRoute: ActivatedRoute,
    private templateDataService: TemplateDataService
  ) {}

  public form: Form;
  public equipment: any;
  public type: string;
  public tableName: string;

  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    this.activatedRoute.queryParams
      .pipe(
        switchMap((equipment: any) => {
          this.equipment = equipment;
          this.tableName = 'asset.' + equipment.lyr_table_name;
          const type = equipment.lyr_table_name.match(new RegExp(/(?<=(aep|ass)_)\w+/))![0];
          if (type) {
            this.type = type.charAt(0).toUpperCase() + type.slice(1);
          }

          return this.templateDataService.getformsTemplate();
        })
      )
      .subscribe((forms: TemplateForm[]) => {
        let form: Form = null;
        if(this.isMobile) {
          form = JSON.parse(forms.find(form => form.formCode === 'EQUIPMENT_DETAILS_VIEW_MOBILE').definition);
        } else {
          form = JSON.parse(forms.find(form => form.formCode === 'EQUIPMENT_DETAILS_VIEW').definition);
        }
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
