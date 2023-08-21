import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { catchError, forkJoin, of } from 'rxjs';
import { ContractWithOrganizationalUnits } from 'src/app/core/models/contract.model';
import { OrganizationalUnit } from 'src/app/core/models/organizational-unit.model';
import { TableCell, Column, TableRow, TypeColumn, TableRowArray } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { Perimeter, PerimeterRow, Profile, User, UserDetail } from 'src/app/core/models/user.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { OrganizationalUnitService } from 'src/app/core/services/organizational-unit.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private toastCtrl: ToastController,
    private modalController: ModalController,
    private organizationalUnitService: OrganizationalUnitService,
    private contractService: ContractService
  ) { }

  @Input("userId") userId: number;

  public userForm: FormGroup;

  public selectedPerimetersRows: TableRow<PerimeterRow>[] = [];

  // References data
  public profiles: Profile[] = [];
  public organizationalUnits: OrganizationalUnit[] = [];
  public regions: OrganizationalUnit[] = [];
  public territories: OrganizationalUnit[] = [];
  public contracts: ContractWithOrganizationalUnits[] = [];

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
          return this.selectedPerimetersRows.length === 0 || this.userForm.disabled; // TODO: Add rights
        }
      },
      {
        name: 'copy',
        onClick: () => {
          // TODO: this.openUsersDetails();
        },
        disableFunction: () => {
          return true; // TODO: Add rights
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.addPerimeterRow();
        },
        disableFunction: () => {
          return this.userForm.disabled; // TODO: Add rights
        }
      }
    ],
  }
  // Table Columns
  public columns: Column<PerimeterRow>[] = [
    {
      format: {
        type: TypeColumn.CHECKBOX,
      },
      size: '1'
    },
    {
      key: 'profileId',
      label: 'Profil',
      size: '2',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: false,
        selectKey: 'id',
        elementLabelFunction: (profile: Profile) => {
          return profile.prfLlabel;
        },
        elementFilterFunction: () => this.profiles,
      },
    },
    {
      key: 'regionIds',
      label: 'Région',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: true,
        selectKey: 'id',
        elementLabelFunction: (org: OrganizationalUnit) => {
          return org.orgLlabel;
        },
        elementFilterFunction: () => this.regions,
      },
      size: '3'
    },
    {
      key: 'territoryIds',
      label: 'Territoire',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: true,
        selectKey: 'id',
        elementLabelFunction: (territory: OrganizationalUnit) => {
          return territory.orgLlabel;
        },
        elementFilterFunction: (row: PerimeterRow) => {
          return row.regionIds && row.regionIds.length > 0
            ? this.territories.filter((org) => row.regionIds.includes(org.orgParentId))
            : this.territories;
        },
      },
      size: '3'
    },
    {
      key: 'contractIds',
      label: 'Contrat',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: true,
        selectKey: 'id',
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
      },
      size: '3'
    },
  ];

  ngOnInit() {
    this.initForm();

    this.fetchInitData();
  }

  private initForm() {
    this.userForm = new FormGroup({
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      status: new FormControl('interne', Validators.required),
      company: new FormControl(null),
      perimeters: new TableRowArray<PerimeterRow>([]),
    });

    this.userForm.get('email').valueChanges.subscribe((newEmail: string) => {
      if (newEmail?.includes('.ext')) {
        this.userForm.get('status').setValue('externe');
      }
    })
  }

  private fetchInitData() {
    forkJoin({
      organizationalUnits: this.organizationalUnitService.getAllOrganizationalUnits(),
      profiles: this.userService.getAllProfiles(),
      contracts: this.contractService.getAllContractsWithOrganizationalUnits(),
      user: this.userService.getUserDetailById(this.userId),
    }).subscribe(({ organizationalUnits, profiles, contracts, user }) => {
      // OrganizationalUnits
      this.organizationalUnits = organizationalUnits;
      this.regions = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === 'REGION');
      this.territories = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === 'TERRITOIRE');

      // Profiles
      this.profiles = profiles;

      // Contracts
      this.contracts = contracts;

      // User
      if (user) {
        this.userForm.patchValue(user);
        for (const perimeter of user.perimeters) {
          this.addPerimeterRow(perimeter);
        }
        this.userForm.disable();
      }
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
        row.get('regionIds').setValue(territories.map((t) => t.orgParentId));

        // If profiles is 'ADMIN_NAT' or 'ADMIN_LOC_1' or 'ADMIN_LOC_2'
        const profileIds = this.profiles
          .filter((prf) => ['ADMIN_NAT', 'ADMIN_LOC_1', 'ADMIN_LOC_2'].includes(prf.prfCode))
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

    this.userService
      .createUser(this.userForm.value)
      .subscribe(async (res: { message: string }) => {
        const toast = await this.toastCtrl.create({
          message: res.message,
          color: 'success',
          duration: 1500,
          position: 'bottom',
        });

        toast.present();
        this.onClose();
      });
  }

  public onClose() {
    this.modalController.dismiss(true);
  }
}
