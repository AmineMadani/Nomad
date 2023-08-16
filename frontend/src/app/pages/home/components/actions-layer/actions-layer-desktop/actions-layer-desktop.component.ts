import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapComponent } from '../../map/map.component';
import { IonPopover, ModalController } from '@ionic/angular';
import { MapService } from 'src/app/core/services/map/map.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavigationEnd, Router } from '@angular/router';
import { delay, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {
  constructor(private mapService: MapService, private router: Router) {}

  @ViewChild('toolbox', { static: true }) toolboxPopover: IonPopover;

  @Input() currentRoute: DrawerRouteEnum;
  @Output() selectedActionEvent: EventEmitter<DrawerRouteEnum> =
    new EventEmitter();

  public drawerRouteEnum = DrawerRouteEnum;
  public isToolboxOpen: boolean = false;

  private currentUri: string = null;
  private mapHeightOrigine: string = null;

  @HostListener('window:afterprint')
  onafterprint() {
    document.getElementById('actions-layer-desktop-content').style.visibility =
      'visible';
    document.getElementById('map-layers-fab').style.visibility = 'visible';
    document.getElementById('map-right-buttons').style.visibility = 'visible';
    document.getElementById('main-header').style.display = 'block';
    document.getElementById('main-content-side-menu').style.visibility =
      'visible';
    (
      document.getElementsByClassName(
        'maplibregl-ctrl maplibregl-ctrl-scale'
      )[0] as HTMLDivElement
    ).style.visibility = 'visible';
    if (this.currentUri) {
      this.router.navigate([this.currentUri]);
      this.currentUri = null;
    }
  }

  ngOnInit() {}

  public onAction(route: DrawerRouteEnum) {
    this.selectedActionEvent.emit(route);
  }

  public onClickDrawingPolygone(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.toolboxPopover.dismiss();
    this.mapService.setDrawMode('draw_polygon');
  }

  public onClickDrawingRectangle(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.toolboxPopover.dismiss();
    this.mapService.setDrawMode('draw_rectangle');
  }

  public displayToolbox(e: Event): void {
    this.toolboxPopover.event = e;
    this.isToolboxOpen = true;
  }

  public async onClickDisplayPrintTool(): Promise<void> {
    this.toolboxPopover.dismiss();
    await this.toolboxPopover.onDidDismiss();
    this.openPrint();
  }

  public async openPrint(): Promise<void> {
    document.getElementById('actions-layer-desktop-content').style.visibility =
      'hidden';
    document.getElementById('map-layers-fab').style.visibility = 'hidden';
    document.getElementById('map-right-buttons').style.visibility = 'hidden';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('main-content-side-menu').style.visibility =
      'hidden';
    (
      document.getElementsByClassName(
        'maplibregl-ctrl maplibregl-ctrl-scale'
      )[0] as HTMLDivElement
    ).style.visibility = 'hidden';

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        take(1)
      )
      .subscribe((event: NavigationEnd) => {
        setTimeout(() => {
          window.print();
        }, 1000);
      });

    if (!this.router.url.endsWith('/home')) {
      this.currentUri = this.router.url;
      this.router.navigate(['/home']);
    } else {
      window.print();
    }
  }
}
