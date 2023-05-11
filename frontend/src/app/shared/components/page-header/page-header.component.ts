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
    private router: Router
  ) {}

  @Input() public headerLabel: string;
  @Input() public forceButtons: boolean;
  @Input() public template: TemplateRef<any>;

  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  public onBackClick(): void {
    this.location.back();
  }

  public onCloseClick(): void {
    this.router.navigate(['home'])
  }
}
