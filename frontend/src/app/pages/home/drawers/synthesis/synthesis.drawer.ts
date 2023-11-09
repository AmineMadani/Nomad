import { Component, OnInit, OnDestroy, Input, Output, TemplateRef, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';

export interface SynthesisButton {
  key: string;
  label: string;
  icon: string;
  disabledFunction?: () => boolean;
}

@Component({
  selector: 'app-synthesis',
  templateUrl: './synthesis.drawer.html',
  styleUrls: ['./synthesis.drawer.scss'],
})
export class SynthesisDrawer implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private utils: UtilsService,
    private mapEventService: MapEventService,
    private drawerService: DrawerService,
    private mapService: MapService,
  ) { }

  @ViewChild('content', { static: true }) content: ElementRef;
  @ViewChild('footer', { static: true }) footer: ElementRef;

  @Input() drawerTitle: string;
  @Input() titleLoading: boolean;
  @Input() hasFile: boolean = false;
  @Input() tabButtons: SynthesisButton[];
  @Input() tabDisabled: boolean;
  @Input() buttonTemplate: TemplateRef<any>;
  @Input() contentTemplate: TemplateRef<any>;
  @Input() footerTemplate: TemplateRef<any>;
  @Input() sourceLayer: string;

  @Output() onTabButton: EventEmitter<SynthesisButton> = new EventEmitter();
  @Output() onDetails: EventEmitter<void> = new EventEmitter();

  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngAfterViewInit(): void {
    if (!this.isMobile && this.footer.nativeElement.children) {
      this.content.nativeElement.classList.add('content-without-footer');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      undefined
    );
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap(),
      undefined,
    );
    this.drawerService.closeDrawer();
  }

  public onTabButtonClicked(button: SynthesisButton): void {
    this.onTabButton.emit(button);
  }

  public onDetailsClicked(): void {
    this.onDetails.emit();
  }
}
