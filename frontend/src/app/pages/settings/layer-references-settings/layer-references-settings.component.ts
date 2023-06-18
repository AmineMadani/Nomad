import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LayerReferences, ReferenceDisplayType, UserReference } from 'src/app/core/models/layer-references.model';
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

  public users: User[];
  public layers: Layer[];
  public userReferences: UserReference[];
  public layerReferences: LayerReferences[];

  public settingsType: SettingsTypeEnum = SettingsTypeEnum.PERSONNAL_SETTINGS;
  public ReferenceDisplayType = ReferenceDisplayType;
  public SettingsTypeEnum = SettingsTypeEnum;

  public form: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      listUserId: new FormControl([]),
      lyrTableName: new FormControl(null, Validators.required),
    });

    // Get the list of users
    this.userDataService.getAllUserAccount().subscribe((users: User[]) => this.users = users);
    // Get the list of layers
    this.layerService.getLayers().then((layers: Layer[]) => this.layers = layers);
    // Get all layer references of the user
    // TODO: It will be certainly change because a user can set the layer references of other users.
    // So in this case we should set the layerReferences list in adequacy with the users selected.
    // But how to manage the case where two selected users have different layer references ?
    this.layerReferencesDataService.getUserLayerReferences().then((layerReferences) => this.layerReferences = layerReferences);

    // Listen form value changes on lyrTableName
    this.form.get('lyrTableName').valueChanges.subscribe((lyrTableName: string) => {
      // Get layer key from lyrTableName
      const layerKey = lyrTableName.split('.')[1];
      // Get the user references for the selected layer
      this.userReferences = this.layerReferences.find((layerReferences) => layerReferences.layerKey === layerKey).references;
    });
  }

  onUserReferencesChecked(event: any, reference: UserReference) {
    reference.displayType = event.detail.checked ? ReferenceDisplayType.SYNTHETIC : ReferenceDisplayType.DETAILED;
  }

  onSettingsTypeChange(newSettingsType: SettingsTypeEnum) {
    this.settingsType = newSettingsType;

    // We set validators in adequacy with input which are in the page
    const listUserIdControl = this.form.get('listUserId');
    if (this.settingsType === SettingsTypeEnum.USERS_SETTINGS) {
      listUserIdControl.setValidators(Validators.required);
    } else {
      listUserIdControl.clearValidators();
    }
    listUserIdControl.updateValueAndValidity();
  }

  isToggleDisabled(ref: UserReference) {
    return ref.referenceKey === 'id' || ref.referenceKey === 'x' || ref.referenceKey === 'y';
  }

  async save() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Get the list of user who will be update in adequacy with the current SettingsType
      let listUserId: number[] = formValues.listUserId;
      if (this.settingsType === SettingsTypeEnum.PERSONNAL_SETTINGS) {
        const currentUser = await this.userService.getUser();
        listUserId = [currentUser.id];
      }

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      this.layerReferencesDataService.saveLayerReferencesUser({ layerReferences: this.userReferences, userIds: listUserId }).subscribe();
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }
}
