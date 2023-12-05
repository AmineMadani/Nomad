import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { ModalController } from '@ionic/angular';
import { ConfigurationService } from 'src/app/core/services/configuration.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-street-view-modal',
  templateUrl: './street-view-modal.component.html',
  styleUrls: ['./street-view-modal.component.scss'],
})
export class StreetViewModalComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private mapEvent: MapEventService,
    private configurationService: ConfigurationService,
  ) {}

  public lat: number;
  public lng: number;

  public isMobile: boolean;

  private map: google.maps.Map;
  private streetView: google.maps.StreetViewPanorama;

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    const apiKey = this.configurationService.googleApiKey;
    if (!apiKey || apiKey.length === 0) {
      this.utils.showErrorMessage(
        `Il n'y a pas de clé Google Maps pour cet environnement. La fonctionnalité n'est pas disponible.`,
        5000
      );
      setTimeout(() => {
        this.onDismiss();
      }, 100);
    }

    const loader = new Loader({
      apiKey: this.configurationService.googleApiKey,
      version: 'weekly',
    });

    const { Map } = await loader.importLibrary('maps');
    const { StreetViewPanorama } = await loader.importLibrary('streetView');

    this.map = new Map(document.getElementById('map-view'), {
      center: { lat: this.lat, lng: this.lng },
      zoom: 14,
    });

    this.streetView = new StreetViewPanorama(document.getElementById('pano'), {
      position: { lat: this.lat, lng: this.lng },
      pov: { heading: 165, pitch: 0 },
      motionTrackingControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
    });

    this.map.setStreetView(this.streetView);
  }

  public onDismiss(): void {
    this.modalCtrl.dismiss();
  }

  public onValidate(): void {
    const { lng, lat } = this.streetView.getPosition().toJSON();

    const address = {
      properties: {
        label: this.streetView.getLocation().description,
      },
      geometry: {
        coordinates: [lng, lat],
      },
    };

    this.mapEvent.setAddressSelected(address);

    this.modalCtrl.dismiss(address);
  }
}
