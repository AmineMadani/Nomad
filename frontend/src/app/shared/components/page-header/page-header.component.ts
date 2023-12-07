import { Location } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent implements OnInit {
  constructor(
    private utils: UtilsService,
    private location: Location,
    private router: Router,
    private mapEventService: MapEventService,
    private mapService: MapService,
  ) {}

  @Input() public headerLabel: string;
  @Input() public displayBackButton: boolean = false;
  @Input() public displayCloseButton: boolean = false;
  @Input() public template: TemplateRef<any>;
  @Input() public loading: boolean;

  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public onBackClick(): void {
    this.location.back();
  }

  public onCloseClick(): void {
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap('home'),
      undefined
    );
    this.router.navigate(['home']);
  }
}
