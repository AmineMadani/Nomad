import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { boundingExtent } from 'ol/extent';
import { transform } from 'ol/proj';
import { Location } from '@angular/common';

export interface SynthesisButton {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-synthesis',
  templateUrl: './synthesis.drawer.html',
  styleUrls: ['./synthesis.drawer.scss'],
})
export class SynthesisDrawer implements OnInit, OnDestroy {
  constructor(
    private router: ActivatedRoute,
    private utils: UtilsService,
    private layerService: LayerService,
    private drawerService: DrawerService,
    private location: Location,
    private route: Router
  ) {
    this.router.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        let { id, layer, extent, x, y } = params;
        if (id && layer) {
          if (!extent && (x && y)) {
            extent = boundingExtent([transform([x, y],'EPSG:4326','EPSG:3857')])
          } else {
            extent = extent.split(',');
          }
          this.layerService.zoomOnXyToFeatureByIdAndLayerKey(extent, id.toString(), layer);
        }
      });
  }

  @Input() drawerTitle: string;
  @Input() hasFile: boolean = false;
  @Input() tabButtons: SynthesisButton[];
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() footerTemplate: TemplateRef<any>;
  @Output() onAttachFile: EventEmitter<void> = new EventEmitter();
  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ionViewWillLeave(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onDrawerBack(): void {
    //this.location.back();
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
    //this.route.navigate(['home']);
    this.drawerService.closeDrawer();
  }

  public onTabButtonClicked(button: SynthesisButton): void {
    this.onTabButton.emit(button);
  }

  public onAttachFileClicked(): void {
    this.onAttachFile.emit();
  }

  public onDetailsClicked(): void {
    this.onDetails.emit();
  }
}
