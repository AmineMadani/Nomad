import { Control } from 'ol/control.js';
import MapOpenLayer from 'ol/Map';

//
// Custom Control : https://openlayers.org/en/latest/examples/custom-controls.html
//

export class ZoomControl extends Control {
  private zoom: number;

  constructor(map: MapOpenLayer) {
    const locate = document.createElement('div');
    locate.className = 'ol-zoom-level';

    super({
      element: locate,
    });

    this.setMap(map);
    this.getZoomLevel();

    this.getMap()?.on('moveend', () => {
      this.getZoomLevel();
    })
    
  }

  getZoomLevel(): void {
    const zoom = Math.round(this.getMap()?.getView().getZoom()!);
    if (zoom !== this.zoom) {
      this.element.innerHTML = `<ion-label class='ol-zoom-level' title='Niveau de Zoom'>Zoom : ${ zoom }</ion-label>`;
      this.zoom = zoom;
    }
  }
}
