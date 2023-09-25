import { Injectable } from '@angular/core';
import { LayerService } from './layer.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(
    private userService: UserService,
    private layerService: LayerService
  ) { }

  async onAppInit(): Promise<void> {
    // Get necessary data in cache to avoid to much api calls
    // TODO: Remove this on web, and just stock the values in the service
    await firstValueFrom(
      forkJoin({
        permissions: this.userService.getAllPermissions(),
        layerReferences: this.layerService.getUserLayerReferences()
      })
    );
  }
}
