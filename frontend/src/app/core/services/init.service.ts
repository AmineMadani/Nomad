import { Injectable } from '@angular/core';
import { LayerService } from './layer.service';
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
    await Promise.all([
      this.userService.getAllPermissions(),
      this.layerService.getUserLayerReferences()
    ]);
  }
}
