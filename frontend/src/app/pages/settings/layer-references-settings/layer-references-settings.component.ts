import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Layer, getLayerLabel, LayerReferences, ReferenceDisplayType, UserReference  } from 'src/app/core/models/layer.model';
import { SettingsTypeEnum } from 'src/app/core/models/settings.model';
import { User, getUserEmail } from 'src/app/core/models/user.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-layer-references-settings',
  templateUrl: './layer-references-settings.component.html',
  styleUrls: ['./layer-references-settings.component.scss'],
})
export class LayerReferencesSettingsPage implements OnInit {

  constructor(
    private layerService: LayerService,
    private userService: UserService
  ) { }

  public users: User[];
  public layers: Layer[];
  public userReferences: UserReference[];
  public layerReferences: LayerReferences[];

  public settingsType: SettingsTypeEnum = SettingsTypeEnum.PERSONNAL_SETTINGS;
  public ReferenceDisplayType = ReferenceDisplayType;
  public SettingsTypeEnum = SettingsTypeEnum;
  public getUserEmail = getUserEmail;
  public getLayerLabel = getLayerLabel;

  public form: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      listUserId: new FormControl([]),
      lyrTableName: new FormControl(null, Validators.required),
    });

    // Get the list of users
    this.userService.getAllUserAccount().subscribe((users: User[]) => this.users = users);
    // Get the list of layers
    this.layerService.getAllLayers().subscribe((layers: Layer[]) => this.layers = layers);
    // Get all layer references of the user
    this.layerService.getUserLayerReferences().subscribe((layerReferences) => this.layerReferences = layerReferences);

    // Listen form value changes on lyrTableName
    this.form.get('lyrTableName').valueChanges.subscribe((lyrTableName: string) => {
      if (lyrTableName) {
        // Get the user references for the selected layer
        this.userReferences = this.layerReferences.find((layerReferences) => layerReferences.layerKey === lyrTableName).references;
      } else {
        this.userReferences = [];
      }
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
        const currentUser = await this.userService.getCurrentUser();
        listUserId = [currentUser.id];
      }

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      this.layerService.saveLayerReferencesUser({ layerReferences: this.userReferences, userIds: listUserId }).subscribe();
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }
}
