import { Injectable } from '@angular/core';
import { Stroke, Style } from 'ol/style.js';

const aepBranche = new Style({
  stroke: new Stroke({ color: 'rgba(243, 104, 224, 1)', width: 3 }),
});
const aepBrancheSelected = new Style({
  stroke: new Stroke({ color: 'rgba(255, 159, 243, 1)', width: 8 }),
});

const aepCanalisation = new Style({
  stroke: new Stroke({ color: 'rgba(52, 31, 151, 1)', width: 3 }),
});
const aepCanalisationSelected = new Style({
  stroke: new Stroke({ color: 'rgba(95, 39, 205, 1)', width: 8 }),
});

const aepDefIncendie = new Style({
  stroke: new Stroke({ color: 'rgba(255, 159, 67, 1)', width: 3 }),
});
const aepDefIncendieSelected = new Style({
  stroke: new Stroke({ color: 'rgba(254, 202, 87, 1)', width: 8 }),
});

const aepOuvrage = new Style({
  stroke: new Stroke({ color: 'rgba(238, 82, 83, 1)', width: 3 }),
});
const aepOuvrageSelected = new Style({
  stroke: new Stroke({ color: 'rgba(255, 107, 107, 1)', width: 8 }),
});

const aepVanne = new Style({
  stroke: new Stroke({ color: 'rgba(10, 189, 227, 1)', width: 3 }),
});
const aepVanneSelected = new Style({
  stroke: new Stroke({ color: 'rgba(72, 219, 251, 1)', width: 8 }),
});

const assAvaloir = new Style({
  stroke: new Stroke({ color: 'rgba(16, 172, 132, 1)', width: 3 }),
});
const assAvaloirSelected = new Style({
  stroke: new Stroke({ color: 'rgba(29, 209, 161, 1)', width: 8 }),
});

const assBranche = new Style({
  stroke: new Stroke({ color: 'rgba(1, 163, 164, 1)', width: 3 }),
});
const assBrancheSelected = new Style({
  stroke: new Stroke({ color: 'rgba(0, 210, 211, 1)', width: 8 }),
});

const assCollecteur = new Style({
  stroke: new Stroke({ color: 'rgba(46, 134, 222, 1)', width: 3 }),
});
const assCollecteurSelected = new Style({
  stroke: new Stroke({ color: 'rgba(84, 160, 255, 1)', width: 8 }),
});

const assOuvrage = new Style({
  stroke: new Stroke({ color: 'rgba(131, 149, 167, 1)', width: 3 }),
});
const assOuvrageSelected = new Style({
  stroke: new Stroke({ color: 'rgba(200, 214, 229, 1)', width: 8 }),
});

const assRegard = new Style({
  stroke: new Stroke({ color: 'rgba(34, 47, 62, 1)', width: 3 }),
});
const assRegardSelected = new Style({
  stroke: new Stroke({ color: 'rgba(87, 101, 116, 1)', width: 8 }),
});

@Injectable({
  providedIn: 'root',
})
export class MapStyleService {
  constructor() {
    this.mapStyle
      .set('aep_branche', aepBranche)
      .set('aep_branche_selected', aepBrancheSelected)
      .set('aep_canalisation', aepCanalisation)
      .set('aep_canalisation_selected', aepCanalisationSelected)
      .set('aep_defense_incendie', aepDefIncendie)
      .set('aep_defense_incendie_selected', aepDefIncendieSelected)
      .set('aep_ouvrage', aepOuvrage)
      .set('aep_ouvrage_selected', aepOuvrageSelected)
      .set('aep_vanne', aepVanne)
      .set('aep_vanne_selected', aepVanneSelected)
      .set('ass_avaloir', assAvaloir)
      .set('ass_avaloir_selected', assAvaloirSelected)
      .set('ass_branche', assBranche)
      .set('ass_branche_selected', assBrancheSelected)
      .set('ass_collecteur', assCollecteur)
      .set('ass_collecteur_selected', assCollecteurSelected)
      .set('ass_ouvrage', assOuvrage)
      .set('ass_ouvrage_selected', assOuvrageSelected)
      .set('ass_regard', assRegard)
      .set('ass_regard_selected', assRegardSelected);
  }

  private mapStyle: Map<string, Style> = new Map();

  public getStyle(layerKey: string): Style {
    return this.mapStyle.get(layerKey)!;
  }

  public getSelStyle(layerKey: string): Style {
    return this.mapStyle.get(`${layerKey}_selected`)!;
  }
}
