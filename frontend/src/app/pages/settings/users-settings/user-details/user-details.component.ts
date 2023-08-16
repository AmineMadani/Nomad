import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { TableCell, Column, TableRow, TypeColumn, TableRowArray } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { Perimeter, User, UserDetail } from 'src/app/core/models/user.model';
import { TableService } from 'src/app/core/services/table.service';
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
    private tableService: TableService
  ) { }

  @Input("user") user: User;

  public userForm: FormGroup;

  public selectedPerimetersRows: TableRow<Perimeter>[] = [];

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
        elements: [
          {
            id: 1,
            label: 'Administrateur'
          },
          {
            id: 2,
            label: 'Agent'
          },
          {
            id: 3,
            label: 'Sous-traitant'
          },
        ],
        selectKey: 'id',
        elementLabelFunction: (fruit: any) => {
          return fruit.label;
        }
      },
    },
    {
      key: 'regionId',
      label: 'Région',
      format: {
        type: TypeColumn.SELECT,
        isMultiSelection: false,
        elements: [
          {
            id: 1,
            label: 'banane'
          },
          {
            id: 2,
            label: 'mangue'
          },
          {
            id: 3,
            label: 'pomme'
          },
        ],
        selectKey: 'id',
        elementLabelFunction: (fruit: any) => {
          return fruit.label;
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
        elements: [
          {
            id: 1,
            label: 'banane'
          },
          {
            id: 2,
            label: 'mangue'
          },
          {
            id: 3,
            label: 'pomme'
          },
        ],
        selectKey: 'id',
        elementLabelFunction: (fruit: any) => {
          return fruit.label;
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
        elements: [
          {
            id: 1,
            label: 'banane'
          },
          {
            id: 2,
            label: 'mangue'
          },
          {
            id: 3,
            label: 'pomme'
          },
        ],
        selectKey: 'id',
        elementLabelFunction: (fruit: any) => {
          return fruit.label;
        }
      },
      size: '3'
    },
  ];

  ngOnInit() {
    this.initForm();
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

  private addPerimeterRow() {
    const row = new TableRow<Perimeter>({
      profileId: new TableCell(null, Validators.required),
      regionId: new TableCell(null),
      territoryId: new TableCell(null),
      contractIds: new TableCell([]),
    });

    row.get('regionId').valueChanges.subscribe((newRegionId) => {
      row.get('territoryId').setValue(newRegionId);
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
