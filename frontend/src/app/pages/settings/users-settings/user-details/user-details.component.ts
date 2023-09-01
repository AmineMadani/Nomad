import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ContractWithOrganizationalUnits } from 'src/app/core/models/contract.model';
import { OrganizationalUnit, OutCodeEnum } from 'src/app/core/models/organizational-unit.model';
import { ActionType } from 'src/app/core/models/settings.model';
import { TableCell, Column, TableRow, TypeColumn, TableRowArray } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { Perimeter, PerimeterRow, Profile, User, PermissionCodeEnum, ProfileCodeEnum } from 'src/app/core/models/user.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { OrganizationalUnitService } from 'src/app/core/services/organizational-unit.service';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { PermissionsSettingsPage } from '../../permissions-settings/permissions-settings.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private organizationalUnitService: OrganizationalUnitService,
    private contractService: ContractService,
    private utilsService: UtilsService,
    private alertController: AlertController
  ) { }

  @Input("userId") userId: number;
  @Input("actionType") actionType: ActionType;
  public ActionType = ActionType;

  public isLoading: boolean = false;

  // Permissions
  public userHasPermissionManageUser: boolean = false;
  public userHasPermissionSetUserRights: boolean = false;

  // Form and table utils rows
  public userForm: FormGroup;
  public selectedPerimetersRows: TableRow<PerimeterRow>[] = [];

  // References data
  public profiles: Profile[] = [];
  public organizationalUnits: OrganizationalUnit[] = [];
  public regions: OrganizationalUnit[] = [];
  public territories: OrganizationalUnit[] = [];
  public contracts: ContractWithOrganizationalUnits[] = [];
  public initialUser: User = null;

  // Table Toolbar
  public toolbar: TableToolbar = {
    title: 'Périmètre et profil',
    buttons: [
      {
        name: 'trash',
        onClick: () => {
          // Get the perimeter table
          const perimetersTable = this.userForm.get('perimeters') as TableRowArray<PerimeterRow>;

          for (const row of this.selectedPerimetersRows) {
            // Find the index of the row in the perimetersTable
            const index = perimetersTable.controls.findIndex(control => control === row);

            if (index !== -1) {
              perimetersTable.removeAt(index);
            }
          }

          this.selectedPerimetersRows = [];
        },
        disableFunction: () => {
          return this.selectedPerimetersRows.length === 0 || !this.userHasPermissionManageUser || !this.userHasPermissionSetUserRights;
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.addPerimeterRow();
        },
        disableFunction: () => {
          return !this.userHasPermissionManageUser || !this.userHasPermissionSetUserRights;
        }
      }
    ],
  }
  // Table Columns
  public columns: Column<PerimeterRow>[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      key: 'profileId',
      label: 'Profil',
      type: TypeColumn.SELECT,
      selectProperties: {
        key: 'id',
        elements: [],
        elementLabelFunction: (profile: Profile) => {
          return profile.prfLlabel;
        }
      }
    },
    {
      key: 'regionIds',
      label: 'Région',
      type: TypeColumn.SELECT,
      selectProperties: {
        key: 'id',
        isMultiSelection: true,
        elements: [],
        elementLabelFunction: (org: OrganizationalUnit) => {
          return org.orgLlabel;
        }
      },
    },
    {
      key: 'territoryIds',
      label: 'Territoire',
      type: TypeColumn.SELECT,
      selectProperties: {
        key: 'id',
        isMultiSelection: true,
        elements: [],
        elementLabelFunction: (territory: OrganizationalUnit) => {
          return territory.orgLlabel;
        },
        elementFilterFunction: (row: PerimeterRow) => {
          return row.regionIds && row.regionIds.length > 0
            ? this.territories.filter((org) => row.regionIds.includes(org.orgParentId))
            : this.territories;
        },
      }
    },
    {
      key: 'contractIds',
      label: 'Contrat',
      type: TypeColumn.SELECT,
      selectProperties: {
        key: 'id',
        isMultiSelection: true,
        elements: [],
        elementLabelFunction: (contract: ContractWithOrganizationalUnits) => {
          return contract.ctrLlabel;
        },
        elementFilterFunction: (row: PerimeterRow) => {
          return row.territoryIds && row.territoryIds.length > 0
            ? this.contracts.filter((ctr) =>
                ctr.organizationalUnits.some((org) => row.territoryIds.includes(org.id))
              )
            : this.contracts;
        },
      }
    },
  ];

  async ngOnInit() {
    this.initForm();

    // Permissions
    this.userHasPermissionManageUser =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.MANAGE_USER_PROFILE);
    this.userHasPermissionSetUserRights =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.SET_USER_RIGHTS);

    this.fetchInitData();
  }

  private initForm() {
    this.userForm = new FormGroup({
      lastName: new FormControl<string>(null, Validators.required),
      firstName: new FormControl<string>(null, Validators.required),
      email: new FormControl<string>(null, Validators.required),
      status: new FormControl<string>(null, Validators.required),
      company: new FormControl<string>(null),
      perimeters: new TableRowArray<PerimeterRow>([]),
    });

    this.userForm.get('email').valueChanges.subscribe((newEmail: string) => {
      if (this.userForm.dirty) {
        if (newEmail?.includes('.ext')) {
          this.userForm.get('status').setValue('externe');
        } else {
          this.userForm.get('status').setValue('interne');
        }
      }
    });
  }

  private fetchInitData() {
    this.isLoading = true;
    forkJoin({
      organizationalUnits: this.organizationalUnitService.getAllOrganizationalUnits(),
      profiles: this.userService.getAllProfiles(),
      contracts: this.contractService.getAllContractsWithOrganizationalUnits(),
      user: this.userService.getUserDetailById(this.userId),
    }).subscribe(({ organizationalUnits, profiles, contracts, user }) => {
      // OrganizationalUnits
      this.organizationalUnits = organizationalUnits;
      this.regions = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === OutCodeEnum.REGION);
      this.territories = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === OutCodeEnum.TERRITORY);

      // Profiles
      this.profiles = profiles;

      // Contracts
      this.contracts = contracts;

      // Fill select data
      this.columns.find((col) => col.key === 'profileId').selectProperties.elements = this.profiles;
      this.columns.find((col) => col.key === 'regionIds').selectProperties.elements = this.regions;
      this.columns.find((col) => col.key === 'territoryIds').selectProperties.elements = this.territories;
      this.columns.find((col) => col.key === 'contractIds').selectProperties.elements = this.contracts;

      // User
      if (user) {
        // If we are in duplication, we reset some values
        if (this.actionType === ActionType.DUPLICATION) {
          user.id = null;
          user.email = null;
          user.lastName = null;
          user.firstName = null;
          user.status = null;
          user.company = null;
        }
        this.initialUser = user;

        // Add user data in fields and table
        this.userForm.patchValue(this.initialUser);
        for (const perimeter of this.initialUser.perimeters) {
          this.addPerimeterRow(perimeter);
        }

        // Permissions
        if (!this.userHasPermissionManageUser) {
          this.userForm.disable();
        } else if (!this.userHasPermissionSetUserRights) {
          const perimetersTable = this.userForm.get('perimeters') as TableRowArray<PerimeterRow>;
          perimetersTable.disable();
        }
      }

      this.isLoading = false;
    });
  }

  private addPerimeterRow(perimeter?: PerimeterRow) {
    // Get the perimeter table
    const perimetersTable = this.userForm.get('perimeters') as TableRowArray<PerimeterRow>;
    // Create the row to add in the table
    const row = this.createTableRow();
    // Subscribe to changes in different rows
    this.subscribeToTerritoryValueChanges(row);
    this.subscribeToContractValueChanges(row);
    // If a perimeter, it adds it's data in the row
    if (perimeter) {
      this.setPerimeterValues(row, perimeter);
    }
    // Push the row in the table and apply changes
    perimetersTable.push(row);
  }

  private createTableRow(): TableRow<PerimeterRow> {
    return new TableRow<PerimeterRow>({
      profileId: new TableCell(null, Validators.required),
      regionIds: new TableCell(null),
      territoryIds: new TableCell(null),
      contractIds: new TableCell(null, Validators.required),
    });
  }

  private subscribeToTerritoryValueChanges(row: TableRow<PerimeterRow>): void {
    row.get('territoryIds').valueChanges.subscribe((newTerritoriesIds) => {
      // If territories are selected
      if (newTerritoriesIds && newTerritoriesIds.length > 0) {
        const territories = this.territories.filter((t) => newTerritoriesIds.includes(t.id));

        // Set automatically the region by orgParentId of the territory
        row.get('regionIds').setValue([...new Set(territories.map(t => t.orgParentId))]);

        // If profiles is 'ADMIN_NAT' or 'ADMIN_LOC_1' or 'ADMIN_LOC_2'
        const profileIds = this.profiles
          .filter((prf) => [ProfileCodeEnum.ADMIN_NAT, ProfileCodeEnum.ADMIN_LOC_1, ProfileCodeEnum.ADMIN_LOC_2].includes(prf.prfCode))
          .map((prf) => prf.id);

        if (profileIds.includes(row.get('profileId').value)) {
          // Set automatically all contracts contains in the territory
          const territoryContractIds = this.contracts
            .filter((ctr) => ctr.organizationalUnits.some((org) => newTerritoriesIds.includes(org.id)))
            .map((ctr) => ctr.id);

          row.get('contractIds').setValue(territoryContractIds.length > 0 ? territoryContractIds : null);
        }
      }
    });
  }

  private subscribeToContractValueChanges(row: TableRow<PerimeterRow>): void {
    row.get('contractIds').valueChanges.subscribe((newContractIds) => {
      // If contracts are selected
      if (newContractIds && newContractIds.length > 0) {
        // Set automaticaly the territories and regions of contracts selected
        const selectedContracts = this.contracts.filter((ctr) => newContractIds.includes(ctr.id));
        const contractsTerritories = this.territories.filter((territory) =>
          selectedContracts.some((ctr) => ctr.organizationalUnits.some((org) => org.id === territory.id))
        );

        // It uses a Set to remove duplicate region, because it can have multiple territories with the same region
        row.get('regionIds').setValue([...new Set(contractsTerritories.map(t => t.orgParentId))]);
        // Emit event false to prevent infinite loop with territories changes listening
        row.get('territoryIds').setValue(contractsTerritories.map(t => t.id), { emitEvent: false });
      }
    });
  }

  private setPerimeterValues(row: TableRow<PerimeterRow>, perimeter: Perimeter): void {
    row.get('profileId').setValue(perimeter.profileId);
    row.get('contractIds').setValue(perimeter.contractIds);
  }

  public getPerimetersControls(): TableRow<PerimeterRow>[] {
    const perimetersTable = this.userForm.get('perimeters') as TableRowArray<PerimeterRow>;
    return perimetersTable.controls as TableRow<PerimeterRow>[];
  }

  public save(): void {
    this.userForm.markAllAsTouched();

    if (!this.userForm.valid) {
      return;
    }

    // Keep the initial data and complete them with formValues
    const userToSave: User = {
      ...this.initialUser,
      ...this.userForm.value
    };

    if (this.actionType === ActionType.CREATION || this.actionType === ActionType.DUPLICATION) {
      this.userService
        .createUser(userToSave)
        .subscribe((res: { message: string }) => {
          this.utilsService.showSuccessMessage(res.message);

          this.onClose(true, false);
        });
    } else if (this.actionType === ActionType.MODIFICATION) {
      this.userService
        .updateUser(userToSave)
        .subscribe((res: { message: string }) => {
          this.utilsService.showSuccessMessage(res.message);

          this.onClose(true, false);
        });
    }
  }

  public async onClose(reloadNeeded: boolean, askConfirmation: boolean) {
    if (askConfirmation && this.userForm.dirty) {
      const alert = await this.alertController.create({
        header: 'Quitter la page sans enregistrer les modifications ?',
        buttons: [
          {
            text: 'Non',
            role: 'cancel',
          },
          {
            text: 'Oui',
            role: 'confirm',
          },
        ],
        cssClass: 'alert-modal'
      });

      await alert.present();

      const { role } = await alert.onDidDismiss();

      if (role === 'confirm') {
        this.modalController.dismiss(reloadNeeded);
      }
    } else {
      this.modalController.dismiss(reloadNeeded);
    }
  }

  public async openPermissions() {
    const modal = await this.modalController.create({
      component: PermissionsSettingsPage,
      componentProps: {
        showCloseBtn: true
      },
      backdropDismiss: false,
      cssClass: 'large-modal'
    });

    return await modal.present();
  }
}
