import { Control } from 'ol/control.js';
import {ScaleLine, defaults as defaultControls} from 'ol/control.js';

//
// Custom Control : https://openlayers.org/en/latest/examples/custom-controls.html
//

export class ScalelineControl extends ScaleLine {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options?: any) {
    const options = opt_options || {units: 'metric'};

    super(options);
  }
}
