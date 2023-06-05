import * as Maplibregl from 'maplibre-gl';

export class CustomZoomControl {
  private map: Maplibregl.Map;
  private container: HTMLDivElement;
  private slider: HTMLInputElement;

  constructor() {}

  public onAdd(map: Maplibregl.Map): HTMLDivElement {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-zoom zoom-range';

    // Create the slider element
    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = '1';
    this.slider.max = '220';
    this.createAttribute(this.slider, 'value', map.getZoom() * 10);

    // Handle slider changes
    this.slider.addEventListener('input', () => {
      const zoomLevel = parseInt(this.slider.value);
      this.map.setZoom(zoomLevel / 10);
    });

    this.container.appendChild(this.slider);
    return this.container;
  }

  createAttribute(
    obj: HTMLInputElement,
    attrName: string,
    attrValue: number
  ): void {
    var att = document.createAttribute(attrName);
    att.value = attrValue.toString();
    obj.setAttributeNode(att);
  }

  onRemove(): void {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
