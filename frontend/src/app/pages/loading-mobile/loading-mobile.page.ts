import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError, forkJoin, switchMap, tap } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { PreferenceService } from 'src/app/core/services/preference.service';
import { TemplateService } from 'src/app/core/services/template.service';
import { UserService } from 'src/app/core/services/user.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

@Component({
  selector: 'app-loading-mobile',
  templateUrl: './loading-mobile.page.html',
  styleUrls: ['./loading-mobile.page.scss'],
})
export class LoadingMobilePage implements OnInit {

  public buffer = 0.05;
  public progress = 0;
  public currentStep = 1;
  public loadingTitles: any[] = [];
  public hasError: boolean = false;

  constructor(
    private contractService: ContractService,
    private cityService: CityService,
    private layerService: LayerService,
    private workorderService: WorkorderService,
    private userService: UserService,
    private templateService: TemplateService,
    private preferenceService: PreferenceService,
    private drawerService: DrawerService,
    private cacheService: CacheService
  ) { }

  ngOnInit() {
    // Get referentials and tiles
    this.fetchAllInitialisationData();
  }

  public fetchAllInitialisationData() {
    this.hasError = false;
    this.cacheService.clearCache();

    this.fetchAllReferential().pipe(
      switchMap(results => this.fetchAllTiles(results))
    ).subscribe(async () => {
      await this.preferenceService.setPreference("loadedApp", "true");
      this.drawerService.navigateTo(DrawerRouteEnum.HOME);
    });
  }

  private fetchAllReferential() {
    const nbReferentialCalls: number = 10;

    this.currentStep = 1;
    this.progress = 0;
    this.buffer = 0.05;
    this.loadingTitles = [
      { key: "contracts", value: "Téléchargement des contrats..." },
      { key: "cities", value: "Téléchargement des villes..." },
      { key: "layers", value: "Téléchargement des couches..." },
      { key: "vLayerWtrs", value: "Téléchargement des vues d'interventions..." },
      { key: "layerIndexes", value: "Téléchargement des index..." },
      { key: "workTaskStatus", value: "Téléchargement des statuts..." },
      { key: "workTaskReasons", value: "Téléchargement des raisons..." },
      { key: "formTemplates", value: "Téléchargement des templates de formulaire..." },
      { key: "permissions", value: "Téléchargement des permissions..." },
      { key: "layerReferences", value: "Téléchargement des références de couche..." },
    ];

    return forkJoin({
      contracts: this.contractService.getAllContracts().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'contracts'))),
      cities: this.cityService.getAllCities().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'cities'))),
      layers: this.layerService.getAllLayers().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'layers'))),
      vLayerWtrs: this.layerService.getAllVLayerWtr().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'vLayerWtrs'))),
      layerIndexes: this.layerService.getLayerIndexes().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'layerIndexes'))),
      workTaskStatus: this.workorderService.getAllWorkorderTaskStatus().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'workTaskStatus'))),
      workTaskReasons: this.workorderService.getAllWorkorderTaskReasons().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'workTaskReasons'))),
      formTemplates: this.templateService.getFormsTemplate().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'formTemplates'))),
      permissions: this.userService.getAllPermissions().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'permissions'))),
      layerReferences: this.layerService.getUserLayerReferences().pipe(tap(() => this.onDownloadDown(nbReferentialCalls, 'layerReferences'))),
    }).pipe(
      catchError(error => {
        console.error("Error during fetchAllReferential:", error);
        this.loadingTitles = [];
        this.hasError = true;
        return EMPTY;
      })
    );
  }

  private fetchAllTiles(results: any) {
    this.progress = 0;
    this.buffer = 0.05;
    this.currentStep = 2;

    // Each request will send 50 tiles max
    const chunkSize = 50;

    // Get only visible layers
    const layers = results.layers.filter((lyr) => lyr.lyrDisplay);

    // Get all the tiles
    const indexFiles: string[] = (results.layerIndexes as any)['features'].map((i) => i['properties']['file']);
    // Get the number of calls which will be made
    const nbTileCalls: number = layers.length * Math.ceil(indexFiles.length / chunkSize);

    const apiCalls: any = {};
    let requestNumber = 0;
    // Browse each layers
    for (const layer of layers) {
      // Get the list of list to send with the chuncksize
      const outputList: string[][] = [];
      for (let i = 0; i < indexFiles.length; i += chunkSize) {
        outputList.push(indexFiles.slice(i, i + chunkSize));
      }

      // Make a request for each batch of 1000 tiles
      for (const files of outputList) {
        apiCalls[`request_${requestNumber}`] = this.layerService
          .getListLayerFile(layer.lyrTableName, files)
          .pipe(
            tap(() => this.onDownloadDown(nbTileCalls, layer.lyrTableName))
          );

        requestNumber++;
      }

      // Show each download is in progress to the user
      this.loadingTitles.push({ key: layer.lyrTableName, value: `Téléchargement des ${layer.lyrSlabel}s ${layer.domLLabel}...`});
    }

    // Send all api calls in the same time
    return forkJoin(apiCalls).pipe(
      catchError(error => {
        console.error("Error during fetchAllTiles:", error);
        this.loadingTitles = [];
        this.hasError = true;
        return EMPTY;
      })
    );
  }

  private onDownloadDown(listSize: number, titleKey: string) {
    this.progress += 1 / listSize;
    this.buffer += 1 / listSize;
    this.loadingTitles = this.loadingTitles.filter((t) => t.key !== titleKey);
  }
}
