import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ContractWithOrganizationalUnits } from 'src/app/core/models/contract.model';
import { OrganizationalUnit } from 'src/app/core/models/organizational-unit.model';
import { TableCell, Column, TableRow, TypeColumn, TableRowArray } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { Perimeter, Profile, User, UserDetail } from 'src/app/core/models/user.model';
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
    private referentialService: ReferentialService,
    private contractService: ContractService
  ) { }

  @Input("user") user: User;

  public userForm: FormGroup;

  public selectedPerimetersRows: TableRow<Perimeter>[] = [];

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
          // TODO: remove lines selected
        },
        disableFunction: () => {
          return this.selectedPerimetersRows.length === 0; // TODO: Add rights
        }
      },
      {
        name: 'copy',
        onClick: () => {
          // TODO: this.openUsersDetails();
        },
        disableFunction: () => {
          return this.selectedPerimetersRows.length !== 1; // TODO: Add rights
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.addPerimeterRow();
        },
        disableFunction: () => {
          return false; // TODO: Add rights
        }
      }
    ],
  }
  // Table Columns
  public columns: Column<Perimeter>[] = [
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
        }
      },
    },
    {
      key: 'regionId',
      label: 'Région',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: false,
        selectKey: 'id',
        elementLabelFunction: (org: OrganizationalUnit) => {
          return org.orgLlabel;
        }
      },
      size: '3'
    },
    {
      key: 'territoryId',
      label: 'Territoire',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: false,
        selectKey: 'id',
        elementLabelFunction: (org: OrganizationalUnit) => {
          return org.orgLlabel;
        }
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
        }
      },
      size: '3'
    },
  ];

  ngOnInit() {
    this.initForm();

    this.fetchInitData();

    // TODO: Si utilisateur, on désactive tous les champs du formulaire
    if (this.user) {
      this.userForm.disable();
    }
  }

  private initForm() {
    this.userForm = new FormGroup({
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      status: new FormControl('interne', Validators.required),
      company: new FormControl(null),
      perimeters: new TableRowArray<Perimeter>([]),
    });
  }

  private fetchInitData() {
    forkJoin({
      organizationalUnits: this.organizationalUnitService.getAllOrganizationalUnits(),
      profiles: this.userService.getAllProfiles(),
      contracts: this.contractService.getAllContractsWithOrganizationalUnits()
    }).subscribe(({ organizationalUnits, profiles, contracts }) => {
      // OrganizationalUnits
      this.organizationalUnits = organizationalUnits;
      this.regions = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === 'REGION');
      this.territories = this.organizationalUnits.filter((organizationalUnit: OrganizationalUnit) => organizationalUnit.outCode === 'TERRITOIRE');

      // Profiles
      this.profiles = profiles;

      // Contracts
      this.contracts = contracts;
    });
  }

  private addPerimeterRow() {
    const row = new TableRow<Perimeter>({
      profileId: new TableCell({
        value: null,
        selectOptions: this.profiles,
        validatorOrOpts: Validators.required
      }),
      regionId: new TableCell({
        value: null,
        selectOptions: this.regions,
      }),
      territoryId: new TableCell({
        value: null,
        selectOptions: this.territories,
      }),
      contractIds: new TableCell({
        value: null,
        selectOptions: this.contracts,
        validatorOrOpts: Validators.required,
      }),
    });

    row.get('regionId').valueChanges.subscribe((newRegionId) => {
      console.log('region change');

      if (newRegionId) {
        const regionTerritories = this.territories.filter((org) => org.orgParentId === newRegionId);
        // Filter the list of territory with the region id
        row.get('territoryId').selectOptions = regionTerritories;
      } else {
        row.get('territoryId').selectOptions = this.territories;
        row.get('territoryId').setValue(null);
      }
    });

    row.get('territoryId').valueChanges.subscribe((newTerritoryId) => {
      console.log('territory change');

      if (newTerritoryId) {
        const territory = this.territories.find((t) => t.id === newTerritoryId);

        // Filter the list of contract with territory id
        row.get('contractIds').selectOptions =
          this.contracts.filter((ctr) => ctr.organizationalUnits.some((org) => org.id === territory.id));

        // Set automatically the region in adequacy with the territory
        row.get('regionId').setValue(territory.orgParentId, { emitEvent: false });
        // Set automtically all the contracts of the region if specific profils are selected
        const profileIds = this.profiles
          .filter((prf) => prf.prfCode === 'ADMIN_NAT' || prf.prfCode === 'ADMIN_LOC_1' || prf.prfCode === 'ADMIN_LOC_2')
          .map((prf) => prf.id);
        if (profileIds.includes(row.get('profileId').value)) {
          const territoryContractIds =
            this.contracts
              .filter((ctr) => ctr.organizationalUnits.some((org) => org.id === territory.id))
              .map((ctr) => ctr.id);
          row.get('contractIds').setValue(territoryContractIds?.length > 1 ? territoryContractIds : null);
        }
      } else {
        // If territory is set to null
        // Reset list of contract
        row.get('contractIds').selectOptions = this.contracts;
        row.get('contractIds').setValue(null);
      }
    });

    row.get('contractIds').valueChanges.subscribe((newContractIds) => {
      console.log('contracts change');

      if (newContractIds && newContractIds.length > 0) {
        const selectedContracts = this.contracts.filter((ctr) => newContractIds.includes(ctr.id));
        const contractsTerritories = this.territories.filter((territory) => selectedContracts.some((ctr) => ctr.organizationalUnits.some((org) => org.id === territory.id)));

        // Set automatically by the first territory
        row.get('territoryId').setValue(contractsTerritories[0].id, { emitEvent: false });
        row.get('regionId').setValue(contractsTerritories[0].orgParentId, { emitEvent: false });
      }
    });

    const perimetersTable = this.userForm.get('perimeters') as TableRowArray<Perimeter>;
    perimetersTable.push(row);
  }

  public getPerimetersControls(): TableRow<Perimeter>[] {
    const perimetersTable = this.userForm.get('perimeters') as TableRowArray<Perimeter>;
    return perimetersTable.controls as TableRow<Perimeter>[];
  }

  public save(): void {
    console.log(this.userForm.getRawValue() as UserDetail);

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
