import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { SettingsTypeEnum } from 'src/app/core/models/settings.model';
import { FormTemplate, FormTemplateUpdate } from 'src/app/core/models/template.model';
import { User, getUserEmail } from 'src/app/core/models/user.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-asset-settings',
  templateUrl: './asset-settings.component.html',
  styleUrls: ['./asset-settings.component.scss'],
})
export class AssetSettingsPage implements OnInit {

  constructor(
    private userService: UserService,
    private templateService: TemplateService,
  ) { }

  public SettingsTypeEnum = SettingsTypeEnum;
  public settingsType: SettingsTypeEnum = SettingsTypeEnum.PERSONNAL_SETTINGS;

  public users: User[];
  public getUserEmail = getUserEmail;

  public assetFilter: FormTemplate;
  public listFilterAsset: FilterAsset[];

  public form: FormGroup;

  public hasChanged = false;

  public dataSource: MatTreeNestedDataSource<FilterAsset> = new MatTreeNestedDataSource<FilterAsset>();
  public treeControl: NestedTreeControl<FilterAsset> = new NestedTreeControl<FilterAsset>(
    (node: FilterAsset) => node.child
  );

  async ngOnInit() {
    this.form = new FormGroup({
      listUserId: new FormControl([]),
    });

    // Get the list of users
    this.userService.getAllUserAccount().then((users: User[]) => this.users = users);
    // Get the asset filter
    this.getListAssetFilter();
  }

  getListAssetFilter() {
    this.templateService.getFormsTemplate().then((listFormTemplate) => {
      this.assetFilter = listFormTemplate.find(form => form.formCode === 'ASSET_FILTER');
      this.listFilterAsset = JSON.parse(this.assetFilter.definition);
      this.dataSource.data = this.listFilterAsset;
    });
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

  hasChild = (_: number, node: FilterAsset): boolean => !!node.child && node.child.length > 0;

  changeVisibleState(node: FilterAsset, forceState?: boolean) {
    if (forceState != null) {
      node.visible = forceState;
    } else {
      node.visible = node.visible === false ? true : false;
    }

    // Change the visible state of its children
    if (node.child?.length > 0) {
      node.child.forEach((child) => {
        this.changeVisibleState(child, node.visible);
      });
    }

    // Calculate the visible state of the parent (and its parent and its parent parent etc...)
    if (forceState == null) {
      this.calculateParentVisibleState(node);
    }

    this.hasChanged = true;
  }

  calculateParentVisibleState(node: FilterAsset) {
    const parent = this.getParent(node, this.listFilterAsset);
    if (parent != null) {
      parent.visible = parent.child.some((child) => child.visible !== false);
      this.calculateParentVisibleState(parent);
    }
  }

  getParent(node: FilterAsset, listFilterAsset: FilterAsset[]): FilterAsset {
    for (let filterAsset of listFilterAsset) {
      if (filterAsset.child?.length > 0) {
        if (filterAsset.child.includes(node)) {
          return filterAsset;
        } else {
          const parent = this.getParent(node, filterAsset.child);
          if (parent != null) {
            return parent;
          }
        }
      }
    }

    return null;
  }

  nodeDown(node: FilterAsset): void {
    let listNode = null;

    // Check if it is a base node
    if (this.listFilterAsset.includes(node)) {
      listNode = this.listFilterAsset;
    }

    // Else check all child
    const parent = this.getParent(node, this.listFilterAsset);
    if (parent != null) {
      listNode = parent.child;
    }

    if (listNode) {
      // Invert the 2 nodes
      const index = listNode.indexOf(node);
      const lineAtLineIndexMinusOne = listNode[index - 1];
      listNode[index] = lineAtLineIndexMinusOne;
      listNode[index - 1] = node;

      // Refresh the data
      this.dataSource.data = null;
      this.dataSource.data = this.listFilterAsset;

      this.hasChanged = true;
    }
  }

  nodeUp(node: FilterAsset): void {
    let listNode = null;

    // Check if it is a base node
    if (this.listFilterAsset.includes(node)) {
      listNode = this.listFilterAsset;
    }

    // Else check all child
    const parent = this.getParent(node, this.listFilterAsset);
    if (parent != null) {
      listNode = parent.child;
    }

    if (listNode) {
      // Invert the 2 nodes
      const index = listNode.indexOf(node);
      const lineAtLineIndexPlusOne = listNode[index + 1];
      listNode[index] = lineAtLineIndexPlusOne;
      listNode[index + 1] = node;

      // Refresh the data
      this.dataSource.data = null;
      this.dataSource.data = this.listFilterAsset;

      this.hasChanged = true;
    }
  }

  isNodeFirst(node: FilterAsset): boolean {
    let listNode = null;

    // Check if it is a base node
    if (this.listFilterAsset.includes(node)) {
      listNode = this.listFilterAsset;
    }

    // Else check all child
    const parent = this.getParent(node, this.listFilterAsset);
    if (parent != null) {
      listNode = parent.child;
    }

    if (listNode) {
      return listNode.indexOf(node) === 0;
    }
    return true;
  }

  isNodeLast(node: FilterAsset) {
    let listNode = null;

    // Check if it is a base node
    if (this.listFilterAsset.includes(node)) {
      listNode = this.listFilterAsset;
    }

    // Else check all child
    const parent = this.getParent(node, this.listFilterAsset);
    if (parent != null) {
      listNode = parent.child;
    }

    if (listNode) {
      return listNode.indexOf(node) === listNode.length - 1;
    }
    return true;
  }

  async save() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Get the list of user who will be update in adequacy with the current AssetFilter
      let listUserId: number[] = formValues.listUserId;
      if (this.settingsType === SettingsTypeEnum.PERSONNAL_SETTINGS) {
        const currentUser = await this.userService.getCurrentUser();
        listUserId = [currentUser.id];
      }

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      const formTemplate: FormTemplateUpdate = {
        fteId: this.assetFilter.fteId,
        fteCode: this.assetFilter.formCode,
        fdnId: this.assetFilter.fdnId,
        fdnCode: 'DEFAULT_' + this.assetFilter.formCode,
        fdnDefinition: JSON.stringify(this.listFilterAsset),
      }

      this.templateService.saveFormTemplateCustomUser({ formTemplate, userIds: listUserId }).then(async () => {
        // Get the saved asset filter if the current user is in the list of user to have this customisation
        const currentUser = await this.userService.getCurrentUser();
        if (listUserId.includes(currentUser.id)) this.getListAssetFilter();
      });
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }

  async deleteCustom() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Get the list of user who will be update in adequacy with the current AssetFilter
      let listUserId: number[] = formValues.listUserId;
      if (this.settingsType === SettingsTypeEnum.PERSONNAL_SETTINGS) {
        const currentUser = await this.userService.getCurrentUser();
        listUserId = [currentUser.id];
      }

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      this.templateService.deleteFormTemplateCustomUser({ id: this.assetFilter.fteId, userIds: listUserId }).then(async () => {
        // Get the default asset filter if the current user is in the list of user to have this customisation
        const currentUser = await this.userService.getCurrentUser();
        if (listUserId.includes(currentUser.id)) this.getListAssetFilter();
      });
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }
}
