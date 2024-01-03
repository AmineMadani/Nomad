import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { SearchAssets } from 'src/app/core/models/asset.model';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { FormTemplate } from 'src/app/core/models/template.model';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import {
  Form,
  FormDefinition,
} from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss'],
})
export class AssetDetailsComponent implements OnInit {
  constructor(
    private utils: UtilsService,
    private activatedRoute: ActivatedRoute,
    private templateService: TemplateService,
    private userService: UserService,
    private drawerService: DrawerService
  ) {}

  public form: Form;
  public asset: any;
  public type: string;
  public tableName: string;

  public isMobile: boolean;

  public userHasPermissionCreateAssetWorkorder: boolean = false;

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    this.userHasPermissionCreateAssetWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_ASSET_WORKORDER);

    this.activatedRoute.queryParams
      .pipe(
        switchMap((asset: any) => {
          this.asset = asset;
          this.tableName = asset.lyrTableName;
          const type = asset.lyrTableName.match(new RegExp(/(?<=(aep|ass)_)\w+/))![0];
          if (type) {
            this.type = type.charAt(0).toUpperCase() + type.slice(1);
          }

          return this.templateService.getFormsTemplate();
        })
      )
      .subscribe((forms: FormTemplate[]) => {
        let form: Form = null;
        if(this.isMobile) {
          form = JSON.parse(forms.find(form => form.formCode === 'ASSET_DETAILS_VIEW_MOBILE').definition);
        } else {
          form = JSON.parse(forms.find(form => form.formCode === 'ASSET_DETAILS_VIEW').definition);
        }
        form.definitions.map((def: FormDefinition) => {
          if (this.asset[def.key]) {
            def.attributes.value = this.asset[def.key];
          }
          return def;
        });
        this.form = form;
      });
  }

  public createWorkorder(): void {
    const searchAssets: SearchAssets[] = [
      {
        lyrTableName: this.asset.lyrTableName,
        assetIds: [this.asset.id]
      }
    ];
    // Mono-asset
    this.drawerService.navigateWithAssets({
      route: DrawerRouteEnum.WORKORDER_CREATION,
      assets: searchAssets,
    });
  }
}
