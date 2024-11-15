import { Injectable } from '@angular/core';
import { FeatureCollection } from 'geojson';
import { UtilsService } from '../utils.service';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as Maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { MapEventService } from './map-event.service';
import { NomadFeature } from '../../models/geojson.model';

export enum DrawingModeEnum {
  SELECTION = 'SELECTION',
  MEASURE = 'MEASURE',
}

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private utils: UtilsService, private mapEvent: MapEventService) {}

  private draw: MapboxDraw;

  private drawActive: boolean = false;
  private isMeasuring: boolean = false;
  private shouldMooveResumeBox: boolean = false;
  public isMobile: boolean;

  public getDraw(): MapboxDraw {
    return this.draw;
  }

  public setDraw(draw: MapboxDraw) {
    this.draw = draw;
  }

  public getIsMeasuring(): boolean {
    return this.isMeasuring;
  }

  public setIsMeasuring(isMeasuring: boolean) {
    if (isMeasuring && this.drawActive) this.drawActive = false;
    this.isMeasuring = isMeasuring;
    if (isMeasuring) {
      this.shouldMooveResumeBox = true;
      this.mapEvent.isFeatureFiredEvent = true;
    } else {
      this.mapEvent.isFeatureFiredEvent = false;
    }
  }

  public getDrawActive(): boolean {
    return this.drawActive;
  }

  public getShouldMooveResumeBox(): boolean {
    return this.shouldMooveResumeBox;
  }

  public setDrawActive(active: boolean) {
    if (active && this.isMeasuring) this.isMeasuring = false;
    this.drawActive = active;
  }

  public endMesure(clean?: boolean): void {
    this.setIsMeasuring(false);
    if (clean) {
      this.deleteDrawing();
    }
  }

  public deleteDrawing(): void {
    this.draw.deleteAll();
  }

  public setDrawMode(mode: string): void {
    this.setDrawActive(true);
    this.draw.changeMode(mode);
  }

  public getDraws(): FeatureCollection {
    return this.draw.getAll();
  }

  public getFeaturesFromDraw(
    e,
    map: Maplibregl.Map,
    currentLayersIds: string[]
  ): NomadFeature[] {
    const [minX, minY, maxX, maxY] = turf.bbox(e.features[0]);

    const drawnPolygon = e.features[0].geometry;

    let features = map.queryRenderedFeatures(
      [map.project([maxX, maxY]), map.project([minX, minY])],
      { layers: currentLayersIds }
    ).filter((feature: any) => {
      // Check if the feature is contained within the drawn polygon
      return !turf.booleanDisjoint(
        feature.geometry,
        drawnPolygon
      );
    });

    return this.utils.removeDuplicatesFromArr(features, 'id');
  }

  private getEscapeMessage(): string {
    let msg = '';
    if (this.shouldMooveResumeBox) {
      if (!this.isMobile) {
        msg += '[Double-Clic] pour terminer le tracé<br/>';
      }
      msg += this.isMobile ? '' : '[Echap] pour terminer';
    } else {
      msg += this.isMobile ? '' : '[Echap] pour terminer';
    }
    return `<br/><i>${msg}</i>`;
  }

  /**
   * Calculate the area and the perimeter
   * @param feature a geometry collection
   * @returns a string contening the perimeter and the area
   */
  public calculateMeasure(feature?: any): string {
    if (!feature || feature?.length === 0) {
      feature = this.getDraws();
    }

    const convertedArea: string = this.convertArea(turf.area(feature));
    const coordinates = turf.coordAll(feature);

    if (coordinates.length > 2) {
      const indexToRemove = coordinates.length - 1;
      coordinates.splice(indexToRemove, 1);
    } else if (coordinates.length < 2) {
      return `<i>Cliquez pour commencer</i>`;
    }

    const perimeter = this.convertPerimeter(
      turf.length(turf.lineString(coordinates), { units: 'meters' })
    );
    let measure = undefined;
    if (convertedArea === '0.00 m²') {
      measure = `<b>Longueur : </b>${perimeter}`;
    } else {
      measure = `<b>Perimètre : </b>${perimeter}<br/><b>Aire : </b>${convertedArea}`;
    }

    measure += this.getEscapeMessage();
    return measure;
  }

  private convertArea(area: number): string {
    if (area < 10000) {
      return area.toFixed(2) + ' m²';
    } else if (area < 1000000) {
      return (area / 10000).toFixed(2) + ' ha';
    } else {
      return (area / 1000000).toFixed(2) + ' km²';
    }
  }

  private convertPerimeter(perimeter: number): string {
    if (perimeter < 1000) {
      return perimeter.toFixed(2) + ' m';
    } else {
      return (perimeter / 1000).toFixed(2) + ' km';
    }
  }

  /**
   * Avoid the resume displayed to moove
   */
  public stopMooveMesureBox(): void {
    this.shouldMooveResumeBox = false;
  }
}
