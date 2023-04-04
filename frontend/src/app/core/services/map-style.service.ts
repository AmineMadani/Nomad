import { Injectable } from '@angular/core';
import { Fill, Stroke, Style, Circle, Text } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle';

const aepBranche = new Style({
  stroke: new Stroke({ color: 'rgba(243, 104, 224, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(243, 104, 224, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(243, 104, 224, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const aepBrancheSelected = new Style({
  stroke: new Stroke({ color: 'rgba(255, 159, 243, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(255, 159, 243, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(255, 159, 243, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const aepCanalisation = new Style({
  stroke: new Stroke({ color: 'rgba(52, 31, 151, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(52, 31, 151, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(52, 31, 151, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const aepCanalisationSelected = new Style({
  stroke: new Stroke({ color: 'rgba(95, 39, 205, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(95, 39, 205, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(95, 39, 205, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const aepDefIncendie = new Style({
  stroke: new Stroke({ color: 'rgba(255, 159, 67, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(255, 159, 67, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(255, 159, 67, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const aepDefIncendieSelected = new Style({
  stroke: new Stroke({ color: 'rgba(254, 202, 87, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(254, 202, 87, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(254, 202, 87, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const aepOuvrage = new Style({
  stroke: new Stroke({ color: 'rgba(238, 82, 83, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(238, 82, 83, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(238, 82, 83, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const aepOuvrageSelected = new Style({
  stroke: new Stroke({ color: 'rgba(255, 107, 107, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(255, 107, 107, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(255, 107, 107, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const aepVanne = new Style({
  stroke: new Stroke({color: 'rgba(10, 189, 227, 1)'}),
  fill : new Fill({ color:'rgba(10, 189, 227, 1)'}),
  image: new CircleStyle({
    radius: 10,
    stroke: new Stroke({
      color: 'rgba(10, 189, 227, 1)',
    }),
    fill: new Fill({
      color: 'rgba(10, 189, 227, 1)',
    }),
  }),
  text: new Text({
    text: '6',
    fill: new Fill({
      color: '#fff',
    }),
  })
});
const aepVanneSelected = new Style({
  stroke: new Stroke({ color: 'rgba(72, 219, 251, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(72, 219, 251, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(72, 219, 251, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const assAvaloir = new Style({
  stroke: new Stroke({ color: 'rgba(16, 172, 132, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(16, 172, 132, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(16, 172, 132, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const assAvaloirSelected = new Style({
  stroke: new Stroke({ color: 'rgba(29, 209, 161, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(29, 209, 161, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(29, 209, 161, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const assBranche = new Style({
  stroke: new Stroke({ color: 'rgba(1, 163, 164, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(1, 163, 164, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(1, 163, 164, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const assBrancheSelected = new Style({
  stroke: new Stroke({ color: 'rgba(0, 210, 211, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(0, 210, 211, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(0, 210, 211, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const assCollecteur = new Style({
  stroke: new Stroke({ color: 'rgba(46, 134, 222, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(46, 134, 222, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(46, 134, 222, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const assCollecteurSelected = new Style({
  stroke: new Stroke({ color: 'rgba(84, 160, 255, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(84, 160, 255, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(84, 160, 255, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const assOuvrage = new Style({
  stroke: new Stroke({ color: 'rgba(131, 149, 167, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(131, 149, 167, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(131, 149, 167, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const assOuvrageSelected = new Style({
  stroke: new Stroke({ color: 'rgba(200, 214, 229, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(200, 214, 229, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(200, 214, 229, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const assRegard = new Style({
  stroke: new Stroke({ color: 'rgba(34, 47, 62, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(34, 47, 62, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(34, 47, 62, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const assRegardSelected = new Style({
  stroke: new Stroke({ color: 'rgba(87, 101, 116, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(87, 101, 116, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(87, 101, 116, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});

const intervention = new Style({
  stroke: new Stroke({ color: 'rgba(2, 104, 224, 1)', width: 3 }),
  fill : new Fill({ color:'rgba(2, 104, 224, 1)'}),
  image: new Circle({
    radius: 7,
    fill: new Fill({color: 'rgba(2, 104, 224, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
});
const interventionSelected = new Style({
  stroke: new Stroke({ color: 'rgba(2, 10, 243, 1)', width: 8 }),
  fill : new Fill({ color:'rgba(2, 10, 243, 1)'}),
  image: new Circle({
    radius: 15,
    fill: new Fill({color: 'rgba(2, 10, 243, 1)'}),
    stroke: new Stroke({color: [0,0,0], width: 1})
  }),
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
      .set('ass_regard_selected', assRegardSelected)
      .set('intervention', intervention)
      .set('intervention_selected', interventionSelected);
  }

  private mapStyle: Map<string, Style> = new Map();

  public getStyle(layerKey: string): Style {
    return this.mapStyle.get(layerKey)!;
  }

  public getSelStyle(layerKey: string): Style {
    return this.mapStyle.get(`${layerKey}_selected`)!;
  }
}
