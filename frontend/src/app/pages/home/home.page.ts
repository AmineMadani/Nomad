import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { MapService } from 'src/app/services/map.service';
import { MapComponent } from './components/map/map.component';
import { BackLayer, MAP_DATASET } from './components/map/map.dataset';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(private utilsService: UtilsService, private mapService: MapService) { }

  @ViewChild('interactiveMap') interactiveMap: MapComponent;

  public selectedContent: string = 'init';
  public backLayers: BackLayer[];

  ngOnInit() {
    this.backLayers = MAP_DATASET.filter((bl) => bl.visible);
  }

  onSelectAction(selectedAction:string) {
    if(selectedAction == this.selectedContent) {
      this.selectedContent = '';
    } else {
      this.selectedContent=selectedAction;
    }
  }

  onMapChange(keyMap:string){
    this.interactiveMap.displayLayer(keyMap);
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }
}
