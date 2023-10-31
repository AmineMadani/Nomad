import {
  Overlay,
  ComponentType,
  OverlayRef,
  GlobalPositionStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, InjectionToken } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { UtilsService } from 'src/app/core/services/utils.service';

export const DIALOG_DATA = new InjectionToken<any>('DIALOG_DATA');

export interface DialogConfig {
  position?: {
    top?: string;
    bottom?: string;
    right?: string;
    left?: string;
  },
  backdrop?: boolean,
  data?: any;
}

export class DialogRef {
  private afterClosedSubject = new Subject<any>();

  constructor(private overlayRef: OverlayRef, private utils: UtilsService) {}

  /**
   * Closes the overlay. You can optionally provide a result.
   */
  public close(result?: any) {
    this.overlayRef.dispose();
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  /**
   * An Observable that notifies when the overlay has closed
   */
  public afterClosed(): Observable<any> {
    return this.afterClosedSubject.asObservable();
  }
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private overlay: Overlay, private injector: Injector, private utils: UtilsService) {}

  private dialogRef: DialogRef | null;

  /**
   * Open a custom component in an overlay
   */
  open<T>(component: ComponentType<T>, config?: DialogConfig): DialogRef {
    let positionStrategy: GlobalPositionStrategy;
    if (config?.position) {
      positionStrategy = this.overlay
        .position()
        .global()
        .top(config.position.top ?? '0px')
        .right(config.position.right ?? '0px')
        .left(config.position.left ?? '0px')
    } else {
      positionStrategy = this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically();
    }

    // Create the overlay with customizable options
    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: config?.backdrop ?? true,
      backdropClass: 'overlay-backdrop',
      panelClass: ['overlay-panel','rightPanelAnimationIn'],
    });

    // Create dialogRef to return
    const dialogRef = new DialogRef(overlayRef, this.utils);

    // Create injector to be able to reference the DialogRef from within the component
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: config?.data },
      ],
    });

    // Attach component portal to the overlay
    const portal = new ComponentPortal(component, null, injector);
    overlayRef.attach(portal);

    this.dialogRef = dialogRef;
    return this.dialogRef;
  }

  public close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  public hasDialog(): boolean {
    return !!this.dialogRef;
  }
}
