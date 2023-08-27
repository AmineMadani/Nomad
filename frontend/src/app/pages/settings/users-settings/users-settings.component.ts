import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Column, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { User, PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { UserDetailsComponent } from './user-details/user-details.component';
import { TableService } from 'src/app/core/services/table.service';
import { ActionType } from 'src/app/core/models/settings.model';

@Component({
  selector: 'app-users-settings',
  templateUrl: './users-settings.component.html',
  styleUrls: ['./users-settings.component.scss'],
})
export class UsersSettingsPage implements OnInit {
  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private tableService: TableService,
    private alertController: AlertController,
  ) { }

  public isLoading: boolean = true;
  public userHasPermissionManageUser: boolean = false;

  public usersRows: TableRow<User>[] = [];
  public selectedUsersRows: TableRow<User>[] = [];

  // Table Toolbar
  public toolbar: TableToolbar = {
    title: 'Liste des utilisateurs',
    buttons: [
      {
        name: 'trash',
        onClick: () => {
          this.deleteUsers();
        },
        disableFunction: () => {
          return this.selectedUsersRows.length === 0 || !this.userHasPermissionManageUser;
        }
      },
      {
        name: 'copy',
        onClick: () => {
          this.openUserDetails(this.selectedUsersRows[0].getRawValue(), ActionType.DUPLICATION);
        },
        disableFunction: () => {
          return this.selectedUsersRows.length !== 1 || !this.userHasPermissionManageUser;
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.openUserDetails(null, ActionType.CREATION);
        },
        disableFunction: () => {
          return !this.userHasPermissionManageUser;
        }
      }
    ],
  }
  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.CHECKBOX,
    },
    {
      type: TypeColumn.ACTION,
      label: '',
      onClick: (row: FormGroup) => {
        this.openUserDetails(row.getRawValue(), ActionType.MODIFICATION);
      }
    },
    {
      type: TypeColumn.TEXT,
      key: 'lastName',
      label: 'Nom'
    },
    {
      type: TypeColumn.TEXT,
      key: 'firstName',
      label: 'Prénom'
    },
    {
      type: TypeColumn.TEXT,
      key: 'email',
      label: 'Adresse mail'
    },
    {
      type: TypeColumn.TEXT,
      key: 'status',
      label: 'Statut'
    },
    {
      type: TypeColumn.TEXT,
      key: 'company',
      label: 'Société'
    },
  ];

  async ngOnInit() {
    // Permissions
    this.userHasPermissionManageUser =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.MANAGE_USER_PROFILE);

    // Get datas
    this.loadUsers();
  }

  private loadUsers() {
    this.isLoading = true;
    this.userService.getAllUserAccount().subscribe((users: User[]) => {
      this.usersRows = this.tableService.createReadOnlyRowsFromObjects(users);
      this.isLoading = false;
    });
  }

  private async openUserDetails(user: User, actionType: ActionType) {
    const modal = await this.modalController.create({
      component: UserDetailsComponent,
      componentProps: {
        userId: user?.id,
        actionType: actionType
      },
      backdropDismiss: false,
      cssClass: 'large-modal'
    });

    modal.onDidDismiss()
      .then((data) => {
        const reloadNeeded: boolean = data['data'];
        // If some data changed
        if (reloadNeeded) {
          this.loadUsers();
        }
      });

    return await modal.present();
  }

  private async deleteUsers() {
    let message: string = '';
    for (const userRow of this.selectedUsersRows) {
      message += "- " + userRow.getRawValue().firstName + ' ' + userRow.getRawValue().lastName + "<br/>";
    }

    const alert = await this.alertController.create({
      header: 'Voulez-vous supprimer le ou les utilisateurs suivants ?',
      message: message,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          role: 'confirm',
        },
      ],
      cssClass: 'alert-modal'
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      const userIds: number[] =
        this.selectedUsersRows.map((userRow) => userRow.getRawValue().id);

      this.userService.deleteUsers(userIds).subscribe(() => {
        this.selectedUsersRows = [];
        this.loadUsers();
      });
    }
  }
}
