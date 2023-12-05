import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-resize-container',
  templateUrl: './resize-container.component.html',
  styleUrls: ['./resize-container.component.scss'],
})
export class ResizeContainerComponent implements OnInit {
  constructor(private mapService: MapService) {}

  @ViewChild('resizeContent') public resizeContent: ElementRef;

  public width: number;
  public isResizing: boolean;

  private maxWidth: number;

  ngOnInit() {
    setTimeout(() => {
      this.getContainerSize();
    }, 100);
  }

  public onResizeClick(): void {
    this.isResizing = true;
  }

  public onResizeStop(): void {
    this.isResizing = false;
  }

  public onResizeMove(e: MouseEvent): void {
    if (this.isResizing) {
      if (e.clientX >= 0 && e.clientX <= this.maxWidth) {
        this.width = e.clientX;
      }
    }
  }

  private getContainerSize(): void {
    const natElement = this.resizeContent.nativeElement;
    this.maxWidth = natElement.offsetWidth;
    this.width = (3 * this.maxWidth) / 10;
  }
}
