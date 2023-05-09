import { Component, OnInit, Input } from '@angular/core';
import { FormAttachment, FormDefinition } from '../../models/form.model';
import { FreeMode, Pagination } from 'swiper';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-form-bottom-attachment',
  templateUrl: './form-bottom-attachment.component.html',
  styleUrls: ['./form-bottom-attachment.component.scss'],
})
export class FormBottomAttachmentComponent implements OnInit {
  constructor(private utils: UtilsService) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  public attributes: FormAttachment;
  public swiperModules: any[];
  public slidesPerView: number = 3;
  public pagination: boolean = false;
  public navigation: boolean = true;
  public loop: boolean = true;

  public opt: {};

  public isOpen: boolean = false;
  public isMobile: boolean = false;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    this.attributes = this.definition.attributes as FormAttachment;
    if (this.isMobile) {
      this.slidesPerView = 1;
      this.navigation = false;
      this.pagination = true;
      this.loop = false;
      this.swiperModules = [Pagination];
    } else {
      this.slidesPerView = 3;
      this.navigation = true;
      this.pagination = false;
      this.loop = true;
      this.swiperModules = [FreeMode];
    }
  }

  public setOpen(state: boolean): void {
    if (this.isMobile) {
      return;
    }
    this.isOpen = state;
  }
}
