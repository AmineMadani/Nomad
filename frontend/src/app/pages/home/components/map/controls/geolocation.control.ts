import { Control } from 'ol/control.js';
import { boundingExtent } from 'ol/extent';
import { LayerService } from 'src/app/core/services/map/layer.service';

//
// Custom Control : https://openlayers.org/en/latest/examples/custom-controls.html
//

export class GeolocationControl extends Control {

  private layerService: LayerService;

  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(layerService: LayerService,
    opt_options?: any
  ) {
    const options = opt_options || {};

    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML =
      "<button class='ol-locate-button' title='Geolocalisation'><ion-icon name='locate-outline'></ion-icon></button>";

    super({
      element: locate,
      target: options.target,
    });

    this.layerService = layerService;
    locate.addEventListener('click', this.handleGeolocation.bind(this), false);
  }

  handleGeolocation() {
    this.layerService.zoomOnMe();
  }
}
