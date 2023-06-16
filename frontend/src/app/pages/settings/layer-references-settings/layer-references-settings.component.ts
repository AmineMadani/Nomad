import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReferenceDisplayType, UserReference } from 'src/app/core/models/layer-references.model';
import { Layer } from 'src/app/core/models/layer.model';
import { SettingsTypeEnum } from 'src/app/core/models/settings.model';
import { User } from 'src/app/core/models/user.model';
import { LayerReferencesDataService } from 'src/app/core/services/dataservices/layer-reference.dataservice';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { UserDataService } from 'src/app/core/services/dataservices/user.dataservice';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-layer-references-settings',
  templateUrl: './layer-references-settings.component.html',
  styleUrls: ['./layer-references-settings.component.scss'],
})
export class LayerReferencesSettingsComponent implements OnInit {

  constructor(
    private layerService: LayerDataService,
    private layerReferencesDataService: LayerReferencesDataService,
    private userDataService: UserDataService,
    private userService: UserService,
  ) { }

  public allUsers: User[];
  public layers: Layer[];
  public userReferences: UserReference[];
  public settingsType: SettingsTypeEnum = SettingsTypeEnum.PERSONNAL_SETTINGS;
  public ReferenceDisplayType = ReferenceDisplayType;
  public SettingsTypeEnum = SettingsTypeEnum;

  public form: FormGroup;

  async ngOnInit() {
    this.form = new FormGroup({
      listUserId: new FormControl([]),
      lyrTableName: new FormControl(null, Validators.required),
    });

    this.userDataService.getAllUserAccount().subscribe((users: User[]) => this.allUsers = users);
    this.layerService.getLayers().subscribe((layers: Layer[]) => this.layers = layers);

    // Écoute des modifications de la valeur de lyrTableName
    this.form.get('lyrTableName').valueChanges.subscribe((value) => {
      this.layerReferencesDataService.getUserLayerReferencesByLyrTableName(value).subscribe((userReferences) => {
        this.userReferences = userReferences;
      });
    });
  }

  onUserReferencesChecked(event: any, reference: UserReference) {
    reference.displayType = event.detail.checked ? ReferenceDisplayType.SYNTHETIC : ReferenceDisplayType.DETAILED;
  }

  onSettingsTypeChange(newSettingsType: SettingsTypeEnum) {
    this.settingsType = newSettingsType;
    const listUserIdControl = this.form.get('listUserId');

    if (this.settingsType === SettingsTypeEnum.USERS_SETTINGS) {
      listUserIdControl.setValidators(Validators.required);
    } else {
      listUserIdControl.clearValidators();
    }

    listUserIdControl.updateValueAndValidity();
  }

  async save() {
    const formValues = this.form.value;
    console.log(formValues);
    console.log(this.userReferences);
    if (this.form.valid) {
      let listUserId: number[] = formValues.listUserId;
      if (this.settingsType === SettingsTypeEnum.PERSONNAL_SETTINGS) {
        const currentUser = await this.userService.getUser();
        listUserId = [currentUser.id];
      }

      console.log(listUserId);
      this.layerReferencesDataService.saveLayerReferencesUser({ layerReferences: this.userReferences, userIds: listUserId }).subscribe((result) => console.log(result));
    } else {
      this.form.markAllAsTouched();
      console.log('form not valid');
    }
  }
}
