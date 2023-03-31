import { Control } from 'ol/control.js';

//
// Custom Control : https://openlayers.org/en/latest/examples/custom-controls.html
//

export class GeolocationControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options?: any) {
    const options = opt_options || {};

    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML =
      "<button class='ol-locate-button' title='Geolocalisation'><ion-icon name='locate-outline'></ion-icon></button>";

    super({
      element: locate,
      target: options.target,
    });

    locate.addEventListener('click', this.handleGeolocation.bind(this), false);

    // TO DO : Create vector layer with user location : https://openlayers.org/workshop/en/mobile/geolocation.html
  }

  handleGeolocation() {
    this.getMap()!.getView().setCenter([-187717.995347, 6132337.474246]);
  }
}
