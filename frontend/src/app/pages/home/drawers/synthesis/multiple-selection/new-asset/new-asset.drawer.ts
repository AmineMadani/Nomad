import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, filter, firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import { FilterAsset } from 'src/app/core/models/filter/filter.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import * as Maplibregl from 'maplibre-gl';
import { Form, FormDefinition, FormPropertiesEnum } from 'src/app/shared/form-editor/models/form.model';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';
import { LayerService } from 'src/app/core/services/layer.service';
import { GEOM_TYPE, Layer } from 'src/app/core/models/layer.model';
import { AssetForSigUpdateDto } from 'src/app/core/models/assetForSig.model';
import { AssetForSigService } from 'src/app/core/services/assetForSig.service';
import { ReportValue } from 'src/app/core/models/workorder.model';

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
    private assetForSigService: AssetForSigService,
  ) { }

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  public drawerTitle: string = 'Nouveau Patrimoine';

  public isMobile: boolean = false;

  public step: number = 1;

  public indexFilterAssetSelection: number = 0;

  public listFilterAsset: FilterAsset[] = [];
  public listChildFilterAsset: FilterAsset[] = [];
  public listSelectedFilterAsset: FilterAsset[] = [];
  public selectedAsset: FilterAsset;
  private listLayers: Layer[] = [];
  private layer: Layer;

  private ngUnsubscribe$: Subject<void> = new Subject();

  public coords: Maplibregl.LngLat;

  public form: Form;
  public indexQuestion: number = 0;
  public listSavedAnswer: ReportValue[] = [];
  public isLoading: boolean = false;

  public isSubmitting: boolean = false;

  async ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    const listFormTemplate = await firstValueFrom(this.templateService.getFormsTemplate());
    const assetFilter = listFormTemplate.find(form => form.formCode === 'ASSET_FILTER');
    this.listFilterAsset = JSON.parse(assetFilter.definition);

    this.listLayers = await firstValueFrom(this.layerService.getAllLayers());

    this.mapService.onMapLoaded().pipe(
      filter((isMapLoaded) => isMapLoaded),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(() => {
      // The user has to select the point on the map where the new asset is
      fromEvent(this.mapService.getMap(), 'click')
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((e: Maplibregl.MapMouseEvent) => {

        /*if (this.mapService.getMeasureEnded()) {
          this.mapService.cleanMesure();
          // ?
        }
        if (!this.mapService.isMeasuring ) {
          this.coords = this.mapService.getMap().unproject(e.point);
          // TODO
          console.log(this.coords.lng, this.coords.lat);
        }*/
      });
    });
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
        this.coords = null;

        // And delete the form
        this.form = null;

        // And delete the saved answer
        this.listSavedAnswer = [];
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
      // If there is no previous question
      if (this.indexQuestion === 0) {
        // Save the answers
        this.listSavedAnswer = [];
        for (let definition of this.formEditor.nomadForm.definitions) {
          if (definition.type == 'property') {
            this.listSavedAnswer.push({
              key: definition.key,
              answer: this.formEditor.form.value[definition.key],
              question: '',
            });
          }
        }

        // Go the previous step
        this.step--;
      } else {
        // Otherwise, display the previous question
        this.indexQuestion--;
      }
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
          //this.mapService.setDrawMode('draw_point');
        } else if (this.layer.astGeomType === GEOM_TYPE.LINE) {
          //this.mapService.setDrawMode('draw_line_string');
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
        const newAssetForm = listFormTemplate.find(form => form.formCode === 'NEW_ASSET_' + this.selectedAsset.layerKey.toUpperCase());
        if (newAssetForm) this.form = JSON.parse(newAssetForm.definition);

        this.isLoading = false;
      }
    } else if (this.step === 3) {
      // Third step
      // Check if the answer is valid
      let child = this.formEditor.sections[0].children[this.formEditor.indexQuestion];
      let childrens = child.children ? child.children : [child];
      let valid: boolean = true;
      for (let children of childrens) {
        this.formEditor.form.get(children.definition.key).updateValueAndValidity();
        this.formEditor.form.get(children.definition.key).markAsTouched();
        valid = valid && this.formEditor.form.get(children.definition.key).valid;
      }

      // If it is not valid, stop here
      if (!valid) return;

      // Check if there is a next question
      if (this.indexQuestion < this.formEditor.sections[0].children.length - 1) {
        // If that's the case then display it
        this.indexQuestion++;
      } else {
        // Otherwise create the new asset
        const listAssetProperties = [];
        for (let definition of this.formEditor.nomadForm.definitions) {
          if (definition.type == 'property') {
            listAssetProperties.push({
              key: definition.key,
              label: definition.label,
              value: this.formEditor.form.value[definition.key] instanceof Array ?
                this.formEditor.form.value[definition.key].join('; ')
                : this.formEditor.form.value[definition.key]
            });
          }
        }

        this.createNewAsset(listAssetProperties);
      }
    }
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  public onDrawerClose(): void {
    this.drawerService.closeDrawer();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private createNewAsset(listAssetProperties) {
    let afsGeom: string = null;
    if (this.layer.astGeomType === GEOM_TYPE.POINT) {
      afsGeom = `POINT (${this.coords.lng} ${this.coords.lat})`;
    } else if (this.layer.astGeomType === GEOM_TYPE.LINE) {
      afsGeom = 'LINESTRING (-1.6801293695429136 47.162501924757024, -1.6800756542707658 47.162528839771035)';
    }

    const assetForSig: AssetForSigUpdateDto = {
      id: null,
      lyrId: this.layer.id,
      afsGeom: afsGeom,
      afsInformations: JSON.stringify(listAssetProperties),
    }

    this.assetForSigService.createAssetForSig(assetForSig).subscribe((id) => {
      // TODO
    });
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

        let lastFormDefinitionId = 5;
        let insert = "";

        for (let key of Object.keys(mapReportForm)) {
          lastFormDefinitionId++;

          insert +=
            `
            INSERT INTO nomad.FORM_DEFINITION (FDN_CODE, FDN_DEFINITION) values ('DEFAULT_NEW_ASSET_${key.toUpperCase()}', '${JSON.stringify(mapReportForm[key])}');
            INSERT INTO nomad.FORM_TEMPLATE (FTE_CODE, FDN_ID) values ('NEW_ASSET_${key.toUpperCase()}', ${lastFormDefinitionId});
            `;
        }

        console.log(insert);
      };
      fileReader.readAsText(file, 'UTF-8');
  }
}
