import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';

/**
 * This directive adds a clear button to an input element or a button element.
 *
 * Inputs:
 * - clearData: data to be cleared by the directive.
 *
 * Outputs:
 * - onClearData: event emitted when the clear button is clicked.
 *
 * Usage:
 * <input clearData="dataToClear" (onClearData)="handleClearData()"/>
 * <button clearData="dataToClear" (onClearData)="handleClearData()"></button>
 */
@Directive({
  selector: '[clearData]'
})
export class ClearDataDirective implements OnInit, OnChanges {

  constructor(
    private el: ElementRef,
    private renderer:Renderer2
  ) 
  {}

  @Input('clearData') data: any;
  @Output('onClearData') onClearData = new EventEmitter();

  clearIcon: any;

  /**
   * Initializes the directive.
   * Adds the clear button if the data input is provided.
   */
  ngOnInit(): void {
    const ionElem = this.el.nativeElement;
    if(this.data) {
      this.addClearDataElement(ionElem);
    }
  }

  /**
   * Called when input properties change.
   * Updates the clear button if the data input is changed.
   */
  ngOnChanges(changes: SimpleChanges): void {
    const ionElem = this.el.nativeElement;
    if(this.clearIcon) {
      this.renderer.removeChild(this.renderer.parentNode(ionElem),this.clearIcon);
      this.clearIcon = undefined;
    }
    if(this.data) {
      this.addClearDataElement(ionElem);
    }
  }

  /**
   * Adds the clear button to the element.
   * Sets up event listener for the clear button click event.
   */
  private addClearDataElement(ionElem: any) {
    this.clearIcon = document.createElement('ion-icon');
    this.clearIcon.setAttribute('name', 'close-outline');
    this.clearIcon.setAttribute('slot', 'end');
    this.clearIcon.style.color = 'gray';
    this.clearIcon.style.fontSize = 'medium';
    this.clearIcon.style.cursor = 'pointer';

    this.renderer.listen(this.clearIcon, 'click', () => {
      this.onClearData.emit();
    });
    this.renderer.parentNode(ionElem).insertBefore(this.clearIcon, ionElem.nextSibling);
  }

}
