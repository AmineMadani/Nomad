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
    await firstValueFrom(
      forkJoin({
        permissions: this.userService.getAllPermissions(),
        layerReferences: this.layerService.getUserLayerReferences()
      })
    );
  }
}
