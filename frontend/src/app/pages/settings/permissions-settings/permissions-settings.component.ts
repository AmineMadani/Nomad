import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Column, TableRow, TypeColumn } from 'src/app/core/models/table/column.model';
import { TableService } from 'src/app/core/services/table.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-permissions-settings',
  templateUrl: './permissions-settings.component.html',
  styleUrls: ['./permissions-settings.component.scss'],
})
export class PermissionsSettingsPage implements OnInit {
  constructor(
    private userService: UserService,
    private tableService: TableService
  ) { }

  public modal: any;
  public isLoading: boolean = false;

  public permissionsRows: TableRow<any>[] = [];

  // Table Columns
  public columns: Column[] = [
    {
      type: TypeColumn.TEXT,
      key: 'perLlabel',
      label: 'Permission',
      width: '400px'
    },
  ];

  async ngOnInit() {
    // Get datas
    this.loadPermissions();
  }

  private loadPermissions() {
    this.isLoading = true;

    forkJoin({
      permissions: this.userService.getAllPermissions(),
      profiles: this.userService.getAllProfiles(),
    }).subscribe(({ permissions, profiles }) => {
      let permissionRows = [];

      for (const profile of profiles) {
        this.columns.push({
          type: TypeColumn.TEXT,
          key: profile.prfCode,
          label: profile.prfLlabel,
          centerText: true,
          width: '150px'
        });
      }

      for (const permission of permissions) {
        const permissionRow = {};

        for (const column of this.columns) {
          const columnProfile = profiles.find((prf) => prf.prfCode === column.key);
          if (columnProfile) {
            permissionRow[column.key] =
              permission.profilesIds.includes(columnProfile.id) ? 'X' : '';
          } else {
            permissionRow[column.key] = permission[column.key];
          }
        }

        permissionRows.push(permissionRow);
      }

      this.permissionsRows = this.tableService.createReadOnlyRowsFromObjects(permissionRows);

      this.isLoading = false;
    });
  }
}
