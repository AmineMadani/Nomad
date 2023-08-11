import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Cell, Column, Row, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { Perimeter, User } from 'src/app/core/models/user.model';
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
    private modalController: ModalController
  ) { }

  @Input("user") user: User;

  public userForm: FormGroup;
  public perimetersTableRows: Row<Perimeter>[] = [];
  public selectedPerimetersTableRows: Row<Perimeter>[] = [];

  // Table Toolbar
  public toolbar: TableToolbar = {
    title: 'Périmètre et profil',
    buttons: [
      {
        name: 'trash',
        onClick: () => {
          // TODO: this.deleteUsers();
        },
        disableFunction: () => {
          return this.selectedPerimetersTableRows.length === 0; // TODO: Add rights
        }
      },
      {
        name: 'copy',
        onClick: () => {
          // TODO: this.openUsersDetails();
        },
        disableFunction: () => {
          return this.selectedPerimetersTableRows.length !== 1; // TODO: Add rights
        }
      },
      {
        name: 'add',
        onClick: () => {
          const row = new Row<Perimeter>({
            profileId: new Cell(null, Validators.required),
            regionId: new Cell(null),
            territoryId: new Cell(null),
            contractIds: new Cell([]),
          });
          this.perimetersTableRows.push(row);
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
    this.userForm = new FormGroup({
      lastname: new FormControl(this.user?.lastName, Validators.required),
      firstname: new FormControl(this.user?.firstName, Validators.required),
      mail: new FormControl(this.user?.email, Validators.required),
      status: new FormControl(this.user?.status ?? 'interne', Validators.required),
      company: new FormControl(this.user?.company)
    });

    // TODO: Push lines in adequation with user datas
    this.perimetersTableRows.push(new Row<Perimeter>({
      profileId: new Cell(null, Validators.required),
      regionId: new Cell(null),
      territoryId: new Cell(null),
      contractIds: new Cell([]),
    }));

    // TODO: Add real rules
    this.perimetersTableRows.forEach((row: Row<Perimeter>) => {
      row.get('regionId').valueChanges.subscribe((newRegionId) => {
        row.get('territoryId').setValue(newRegionId);
      })
    });

    // TODO: Si utilisateur, on désactive tous les champs du formulaire
    if (this.user) {
      this.userForm.disable();
    }
  }

  public save(): void {
    console.log(this.userForm);
    this.perimetersTableRows.forEach((group) => console.log(group.getRawValue()));

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
