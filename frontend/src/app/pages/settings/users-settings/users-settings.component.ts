import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Column, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { UserDetailsComponent } from './user-details/user-details.component';
import { TableService } from 'src/app/core/services/table.service';

@Component({
  selector: 'app-users-settings',
  templateUrl: './users-settings.component.html',
  styleUrls: ['./users-settings.component.scss'],
})
export class UsersSettingsPage implements OnInit {
  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private tableService: TableService
  ) { }

  public modal: any;

  public usersRows: TableRow<User>[] = [];
  public selectedUsersRows: TableRow<User>[] = [];

  // Table Toolbar
  public toolbar: TableToolbar = {
    title: 'Liste des utilisateurs',
    buttons: [
      {
        name: 'trash',
        onClick: () => {
          // TODO: this.deleteUsers();
        },
        disableFunction: () => {
          return this.selectedUsersRows.length === 0; // TODO: Add rights
        }
      },
      {
        name: 'copy',
        onClick: () => {
          // TODO: this.openUsersDetails();
        },
        disableFunction: () => {
          return this.selectedUsersRows.length !== 1; // TODO: Add rights
        }
      },
      {
        name: 'add',
        onClick: () => {
          this.openUserDetails(null);
        },
        disableFunction: () => {
          return false; // TODO: Add rights
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
        this.openUserDetails(row.getRawValue());
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
    // Get datas
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getAllUserAccount().subscribe((users: User[]) => {
      this.usersRows = this.tableService.createReadOnlyRowsFromObjects(users);
    });
  }

  private async openUserDetails(user: User) {
    const modal = await this.modalController.create({
      component: UserDetailsComponent,
      componentProps: {
        userId: user?.id
      },
      backdropDismiss: false,
      cssClass: 'custom-modal'
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

  // private async deleteUsers() {
  //   const deleteRequests = this.selectedUsers.map(user =>
  //     this.userService.deleteUser(user.id)
  //   );

  //   forkJoin(deleteRequests).subscribe(() => {
  //     this.selectedUsers = [];
  //     this.loadUsers();
  //   });
  // }
}
