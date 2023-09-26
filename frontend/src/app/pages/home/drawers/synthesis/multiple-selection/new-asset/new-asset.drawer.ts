import { Component, OnInit } from '@angular/core';
import { Subject, firstValueFrom, fromEvent, merge, takeUntil } from 'rxjs';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import * as Maplibregl from 'maplibre-gl';
import { Form, FormDefinition, FormPropertiesEnum } from 'src/app/shared/form-editor/models/form.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { GEOM_TYPE, Layer } from 'src/app/core/models/layer.model';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { AssetForSigDto } from 'src/app/core/models/assetForSig.model';
import { Workorder } from 'src/app/core/models/workorder.model';
import { ActivatedRoute } from '@angular/router';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-asset',
  templateUrl: './new-asset.drawer.html',
  styleUrls: ['./new-asset.drawer.scss'],
})
export class NewAssetDrawer implements OnInit {

  constructor(
    private templateService: TemplateService,
    private drawerService: DrawerService,
    private utils: UtilsService,
    private mapService: MapService,
    private layerService: LayerService,
    private mapEventService: MapEventService,
    private activatedRoute: ActivatedRoute,
    private workorderService: WorkorderService,
  ) { }

  public drawerTitle: string = 'Nouveau Patrimoine';

  public isMobile: boolean = false;

  private wkoDraft: number = null;

  public step: number = 1;

  public indexFilterAssetSelection: number = 0;

  public listFilterAsset: FilterAsset[] = [];
  public listChildFilterAsset: FilterAsset[] = [];
  public listSelectedFilterAsset: FilterAsset[] = [];
  public selectedAsset: FilterAsset;
  private listLayers: Layer[] = [];
  private layer: Layer;

  public coords: number[][] = [];

  public form: FormGroup;
  public isLoading: boolean = false;
  public listDefinition: FormDefinition[] = [];

  public isSubmitting: boolean = false;

  private terminateDrawing$: Subject<void> = new Subject();

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    this.wkoDraft = this.activatedRoute.snapshot.queryParams?.['draft'];

    const listFormTemplate = await firstValueFrom(this.templateService.getFormsTemplate());
    const assetFilter = listFormTemplate.find(form => form.formCode === 'ASSET_FILTER');
    this.listFilterAsset = JSON.parse(assetFilter.definition);

    this.listLayers = await firstValueFrom(this.layerService.getAllLayers());
  }

  ngOnDestroy(): void {
    this.removeDrawingLayer();
    this.terminateDrawing$.complete();
  }

  public selectFilterAsset(filterAsset: FilterAsset): void {
    // If the selection already exists for this step, replace it
    if (this.listSelectedFilterAsset.length > this.indexFilterAssetSelection) {
      const previouslySelectedAsset = this.listSelectedFilterAsset[this.indexFilterAssetSelection];
      this.listSelectedFilterAsset[this.indexFilterAssetSelection] = filterAsset;

      // If it was not the same
      if (previouslySelectedAsset !== filterAsset) {
        // Delete the next selected assets
        this.listSelectedFilterAsset.length = this.indexFilterAssetSelection + 1;

        // And delete the final select asset
        this.selectedAsset = null;
        this.layer = null;

        // And unselect the coordonates
        this.removeDrawingLayer();
        this.coords = [];

        // And delete the form
        this.form = null;
      }
    } else {
      // Else add the asset to the list
      this.listSelectedFilterAsset.push(filterAsset);
    }
  }

  public previous() {
    // First step
    if (this.step === 1) {
      // Get the list of previous child (if its not the first index)
      this.indexFilterAssetSelection--;
      if (this.indexFilterAssetSelection > 0) {
        this.listChildFilterAsset = this.listSelectedFilterAsset[this.indexFilterAssetSelection - 1].child;
      }
    } else if (this.step === 2) {
      // Second step
      // Go to the previous step
      this.step--;
    } else if (this.step === 3) {
      // Third step
      // Go to the previous step
      this.step--;
    }
  }

  public async next() {
    // First step
    if (this.step === 1) {
      // Check if the selected asset has child
      const selectedFilterAsset = this.listSelectedFilterAsset[this.indexFilterAssetSelection];
      if (selectedFilterAsset.child) {
        // If it's the case then display those childs
        this.listChildFilterAsset = selectedFilterAsset.child;
        this.indexFilterAssetSelection++;
      } else {
        // Otherwise, select the asset and go to the next step
        this.selectedAsset = selectedFilterAsset;
        this.layer = this.listLayers.find((layer) => layer.lyrTableName === this.selectedAsset.layerKey);
        if (this.layer.astGeomType === GEOM_TYPE.POINT) {
          this.addDrawingLayer(1);
        } else if (this.layer.astGeomType === GEOM_TYPE.LINE) {
          this.addDrawingLayer();
        }
        this.step++;
      }
    } else if (this.step === 2) {
      // Second step
      // Go to the next step
      this.step++;

      // Load the form, if it is not loaded already
      if (!this.form) {
        this.isLoading = true;

        const listFormTemplate = await firstValueFrom(this.templateService.getFormsTemplate());
        const newAsseTemplate = listFormTemplate.find(form => form.formCode === 'NEW_ASSET_' + this.selectedAsset.layerKey.toUpperCase());
        if (newAsseTemplate) {
          const newAssetForm: Form = JSON.parse(newAsseTemplate.definition);

          this.form = new FormGroup({});

          this.listDefinition = newAssetForm.definitions.filter((definition) => definition.type === 'property');
          for (const [index, definition] of this.listDefinition.entries()) {
            // Add the question to the form
            this.form.addControl(definition.key, new FormControl<any>(null))
            
            // Add the validator if it is a required field
            if (definition.rules.some((rule) => rule.key === 'required')) {
              this.form.get(definition.key).addValidators([Validators.required]);
            }
          }
        }

        this.isLoading = false;
      }
    }
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
    this.drawerService.closeDrawer();
  }

  public async create() {
    this.form.updateValueAndValidity();
    this.form.markAllAsTouched();

    // Check that the form is valid
    if (!this.form.valid) return;

    const formValue = this.form.value;

    const listAssetProperties = [];
    for (let definition of this.listDefinition) {
      listAssetProperties.push({
        key: definition.key,
        label: definition.label,
        value: formValue[definition.key] instanceof Array ? formValue[definition.key].join('; ') : formValue[definition.key]
      });
    }

    const assetForSig: AssetForSigDto = {
      id: this.utils.createCacheId(),
      lyrId: this.layer.id,
      afsGeom: null,
      afsInformations: JSON.stringify(listAssetProperties),
      coords: this.coords,
    }

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(this.wkoDraft);
      const lStatus = await firstValueFrom(this.workorderService.getAllWorkorderTaskStatus());
      wko.tasks.push({
        id: this.utils.createCacheId(),
        assObjTable: this.layer.lyrTableName,
        assObjRef: "TMP-" + assetForSig.id,
        longitude: this.coords[0][0],
        latitude: this.coords[0][1],
        wtrId: wko.tasks[0]?.wtrId ?? null,
        wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id,
        assetForSig: assetForSig,
      });
      await this.workorderService.saveCacheWorkorder(wko);
    }

    this.drawerService.setLocationBack();
  }

  private addDrawingLayer(nPoints?: number): void {
    this.mapEventService.isFeatureFiredEvent = true;
    const map = this.mapService.getMap();

    if (map.getSource('geojson') != null) return;

    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    // Used to draw a line between points
    const linestring = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    };

    map.addSource('geojson', {
      type: 'geojson',
      data: geojson,
    });

    // Add styles to the map
    map.addLayer({
      id: 'measure-points',
      type: 'circle',
      source: 'geojson',
      paint: {
        'circle-radius': 5,
        'circle-color': '#000',
      },
      filter: ['in', '$type', 'Point'],
    });

    map.addLayer({
      id: 'measure-lines',
      type: 'line',
      source: 'geojson',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#000',
        'line-width': 2.5,
      },
      filter: ['in', '$type', 'LineString'],
    });

    if (this.coords.length > 0) {
      this.addExistingCoords(map, geojson, linestring);
    }

    merge(fromEvent(map, 'click'), fromEvent(map, 'touchend')) 
      .pipe(takeUntil(this.terminateDrawing$))
      .subscribe((e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['measure-points'],
        });

        if (geojson.features.length > 1) geojson.features.pop();

        if (nPoints !== undefined) {
          // If nPoints is defined, handle the limit
          if (nPoints === 1) {
            // Rule 3: If nPoints is set to 1, replace the existing point
            geojson.features = [];
          } else if (nPoints > 1 && geojson.features.length >= nPoints) {
            // Rule 2: If nPoints is greater than 1 and the limit is reached, replace the first point
            geojson.features.shift();
          }
        }

        if (features.length) {
          // Rule 4: If a feature was clicked, remove it from the map
          const id = features[0].properties['id'];
          geojson.features = geojson.features.filter((point) => {
            return point.properties.id !== id;
          });
        } else {
          // Add a new point if no existing point was clicked
          const point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
              id: String(new Date().getTime()),
            },
          };

          geojson.features.push(point);
        }

        if (geojson.features.length > 1) {
          linestring.geometry.coordinates = geojson.features.map((point) => {
            return point.geometry.coordinates;
          });

          geojson.features.push(linestring);
        }

        (map.getSource('geojson') as any).setData(geojson);

        this.coords = geojson.features
          .filter((f) => f.geometry.type === 'Point')
          .map((f) => f.geometry.coordinates);
      });
  }

  private addExistingCoords(
    map: Maplibregl.Map,
    geojson: any,
    linestring: any
  ): void {
    if (this.coords.length === 1) {
      // Add a single point if there's only one coordinate pair
      const point = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.coords[0][0], this.coords[0][1]],
        },
        properties: {
          id: String(new Date().getTime()),
        },
      };

      geojson.features.push(point);
    } else if (this.coords.length > 1) {
      // Add points and a line if there are multiple coordinate pairs
      for (const coord of this.coords) {
        const point = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coord[0], coord[1]],
          },
          properties: {
            id: String(new Date().getTime()),
          },
        };

        geojson.features.push(point);
        linestring.geometry.coordinates.push([coord[0], coord[1]]);
      }

      geojson.features.push(linestring);
    }

    (map.getSource('geojson') as any).setData(geojson);
  }

  private removeDrawingLayer(): void {
    const map = this.mapService.getMap();
    if (map.getLayer('measure-points') != null) map.removeLayer('measure-points');
    if (map.getLayer('measure-lines') != null) map.removeLayer('measure-lines');
    if (map.getSource('geojson') != null) map.removeSource('geojson');
    this.terminateDrawing$.next();
    this.mapEventService.isFeatureFiredEvent = false;
  }

  // ##### HIDDEN ##### //
  public createFormDefinitionFromCSVFile(event) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    let file: Blob = event.target.files[0];
      event.target.value = null;
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        const csv = fileReader.result as string;
        const csvLineArray = csv.split(/\r\n|\r|\n/);
        const listHeader = csvLineArray[0].split(';');

        const mapLineByLayer = {};
        for (let i = 1; i < csvLineArray.length; i++) {
          const lines = csvLineArray[i].split(';');
          const line = {};
          for (let j = 0; j < lines.length; j++) {
            line[listHeader[j]] = lines[j];
          }

          let listLine = mapLineByLayer[line['pg_table']];
          if (listLine == null) {
            listLine = [];
            mapLineByLayer[line['pg_table']] = listLine;
          }
          listLine.push(line);
        }

        const mapReportForm = {};

        // For each layer
        for (let key of Object.keys(mapLineByLayer)) {
          // If there is data in the form
          const listAllLine = mapLineByLayer[key];
          const lineLine = listAllLine.filter((line) => line['Création patrimoine'] === 'Oui');
          if (lineLine.length > 0) {
            const reportForm: Form = {
              key: 'NEW_ASSET_' + key.toUpperCase(),
              editable: true,
              definitions: [],
              relations: [],
            }
        
            // Add the start definition
            const startDefinition: FormDefinition = {
              key: 'questionPrincipal',
              type: 'section',
              label: '',
              component: 'question',
              editable: true,
              attributes: {},
              rules: [],
            }
            reportForm.definitions.push(startDefinition);

            // Add each definition
            for (let i = 0; i < lineLine.length; i++) {
              const line = lineLine[i];
        
              const definition: FormDefinition = {
                key: line['column_name'],
                type: 'property',
                label: line['alias_name'],
                component: null,
                editable: true,
                attributes: {},
                rules: [],
                section: startDefinition.key,
              }

              const dataType = line['data_type'];
        
              // Component
              if (['text'].includes(dataType)) {
                definition.component = FormPropertiesEnum.INPUT;
                definition.attributes = {
                  type: 'text',
                  hiddenNull: false,
                }
              }
              if (['numeric', 'int4', 'float8'].includes(dataType)) {
                definition.component = FormPropertiesEnum.INPUT;
                definition.attributes = {
                  type: 'number',
                  hiddenNull: false,
                }
              }

              if (['bool'].includes(dataType)) {
                definition.component = FormPropertiesEnum.SELECT;
                definition.attributes = {
                  value: '',
                  options: [
                    {
                      key: true,
                      value: 'Oui',
                    },
                    {
                      key: false,
                      value: 'Non',
                    }
                  ],
                  multiple: false,
                }
              }
        
              // Rules
              if (line['Obligatoire ?'] === 'Oui') {
                definition.rules.push({
                  key: 'required',
                  value: 'Obligatoire',
                  message: 'Ce champ est obligatoire',
                });
              }
        
              reportForm.definitions.push(definition);
            }

            mapReportForm[key] = reportForm;
          }
        }

        let listValueDefinition: string[] = [];
        let listValueTemplate: string[] = [];

        for (let key of Object.keys(mapReportForm)) {
          const fdnCode = `DEFAULT_NEW_ASSET_${key.toUpperCase()}`;
          const fteCode = `NEW_ASSET_${key.toUpperCase()}`;

          listValueDefinition.push(`('${fdnCode}', '${JSON.stringify(mapReportForm[key])}')`);
          listValueTemplate.push(`('${fteCode}', (SELECT ID FROM nomad.FORM_DEFINITION WHERE FDN_CODE = '${fdnCode}'))`);
        }

        console.log(
          "INSERT INTO nomad.FORM_DEFINITION (FDN_CODE, FDN_DEFINITION) values \n" +
          listValueDefinition.join(',\n') + ';'
        );
        console.log(
          "INSERT INTO nomad.FORM_TEMPLATE (FTE_CODE, FDN_ID) values \n" +
          listValueTemplate.join(',\n') + ';'
        );
      };
      fileReader.readAsText(file, 'UTF-8');
  }
}
