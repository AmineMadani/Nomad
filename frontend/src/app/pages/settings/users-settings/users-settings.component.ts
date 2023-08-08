import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Column, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableToolbar } from 'src/app/core/models/table/toolbar.model';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { UserDetailsComponent } from './user-details/user-details.component';

@Component({
  selector: 'app-users-settings',
  templateUrl: './users-settings.component.html',
  styleUrls: ['./users-settings.component.scss'],
})
export class UsersSettingsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) { }

  public form: FormGroup;
  public modal: any;
  // Styles
  public users: User[] = [];
  public selectedUsers: User[] = [];

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
          return this.selectedUsers.length === 0; // TODO: Add rights
        }
      },
      {
        name: 'copy',
        onClick: () => {
          // TODO: this.openUsersDetails();
        },
        disableFunction: () => {
          return this.selectedUsers.length !== 1; // TODO: Add rights
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
      size: '1'
    },
    {
      type: TypeColumn.ACTION,
      label: '',
      size: '1',
      onClick: (user: User) => {
        this.openUserDetails(user);
      }
    },
    {
      key: 'lastName',
      label: 'Nom',
      type: TypeColumn.TEXT,
      size: '2'
    },
    {
      key: 'firstName',
      label: 'Prénom',
      type: TypeColumn.TEXT,
      size: '2'
    },
    {
      key: 'email',
      label: 'Adresse mail',
      type: TypeColumn.TEXT,
      size: '3'
    },
    {
      key: 'status',
      label: 'Statut',
      type: TypeColumn.TEXT,
      size: '1'
    },
    {
      key: 'company',
      label: 'Société',
      type: TypeColumn.TEXT,
      size: '2'
    },
  ];

  async ngOnInit() {
    // Get datas
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getAllUserAccount().subscribe((users: User[]) => {
      this.users = users;
    });
  }

  private async openUserDetails(user: User) {
    const modal = await this.modalController.create({
      component: UserDetailsComponent,
      componentProps: {
        user: user
      },
      backdropDismiss: true,
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
