import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Layer, LayerStyleDetail, SaveLayerStylePayload } from 'src/app/core/models/layer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { Navigation } from 'swiper';

@Component({
  selector: 'app-layer-style',
  templateUrl: './layer-style.component.html',
  styleUrls: ['./layer-style.component.scss'],
})
export class LayerStyleComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private layerService: LayerService,
    private utilsService: UtilsService
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("lseId") lseId;
  @Input("parentLayer") parentLayer: Layer;

  //Definition Ids 
  public definitionIdList : any[] ;
  //Zoom Values to present
  public zoomValues : any[] = new Array<string>() ;
  public isMobile: boolean;

  public isCreation: boolean = true;
  public form: FormGroup;
  public reloadNeededInPreviousScreen: boolean = false;

  public layerStyle: LayerStyleDetail;

  // Swiper specific variables
  public swiperModules = [Navigation];
  public opts: {
    slidesPerView: true
  }

  async ngOnInit() {
    this.isCreation = !this.lseId;
    this.isMobile = this.utilsService.isMobilePlateform();
    //Values from 5 to 20
    for (let i = 5; i <=20;  i++){
      this.zoomValues.push(i);
    }

    this.form = new FormGroup({
      lyrTableName: new FormControl({ value: null, disabled: true }, Validators.required),
      lseCode: new FormControl(null, Validators.required),
      sydDefinition: new FormControl(null, Validators.required),
      definitionIdName :  new FormControl(''),
      minzoomValue :  new FormControl(''),
    });

    if (!this.isCreation) {
      this.layerService.getLayerStyleById(this.lseId)
        .then((lse: LayerStyleDetail) => {
          this.layerStyle = lse;
          this.layerStyle.listImage = lse.listImage;
          this.loadDefinitionIds();

          this.form.patchValue(lse);
        });
    } else {
      // Initialisation du layer style
      this.layerStyle = {
        lyrId: this.parentLayer.id,
        lyrTableName: this.parentLayer.lyrTableName,
        lseId: null,
        lseCode: null,
        sydId: null,
        sydDefinition: null, // Json
        listImage: [],
      }
      this.form.get('lyrTableName').setValue(this.parentLayer.lyrTableName);
    }
  }

  onFileChanged(event) {
    this.layerStyle.listImage = [];

    Array.from(event.target.files).forEach((file: any) => {
      let reader = new FileReader();

      reader.onload = (e: any) => {
        let base64Image: string = e.target.result;
        let img = new Image();
        img.src = base64Image;

        img.onload = () => {
          let canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          let pngImage = canvas.toDataURL("image/png");

          this.layerStyle.listImage.push({
            code: file.name.split('.svg')[0],
            source: pngImage
          });
        }
      }

      reader.readAsDataURL(file);
    });
  }

  /**
   * Récupère tous les champs minZoom 
   */
   loadDefinitionIds() : void{
    let jsonArray = JSON.parse(this.layerStyle.sydDefinition);
    this.definitionIdList = new Array<string>();
    for (let i = 0; i < jsonArray.length; i++){
      this.definitionIdList .push( {id : i,
                    label : jsonArray[i].id,
                    minzoom : jsonArray[i].minzoom });
    }
    //Default Selection
    this.setDefinitionId(0)
    this.setMinZoomValue(0);
  }

  /**
   * Set la valeurs du minZoom dans le combo lorsqu'on sélectionne un id
   * @param event 
   */
    selectedDefinitionId(event: any) {
    this.form.get('minzoomValue').setValue(this.definitionIdList[event.detail.value].minzoom);
    }

    /**
     * Set la valeurs de minZoom dans la définition
     * @param event 
     */
    selectedMinZoom(event: any) {
      if (this.form.get('definitionIdName')){
        this.updateDefinitionJson();
      }
      }

    /**
     * Sauvegarde la valeurs minZoom dans la définition
     */
  updateDefinitionJson() : void  {
    let indexDefinition = this.form.get('definitionIdName').value;
    let definition = this.layerStyle.sydDefinition;
    let jsonArray = JSON.parse(definition);
    jsonArray[indexDefinition].minzoom =  this.form.get('minzoomValue').value;
    this.layerStyle.sydDefinition  = JSON.stringify(jsonArray);
    this.form.get('sydDefinition').setValue(JSON.stringify(jsonArray));
  }

  setDefinitionId(index : number){
    this.form.get('definitionIdName').setValue(this.definitionIdList[index].id);
  }

  setMinZoomValue(index : number): void{
    this.form.get('minzoomValue').setValue(this.definitionIdList[index].minzoom);
  }


  onSave() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Complete layer style with form data
      this.layerStyle = {
        ...this.layerStyle,
        ...formValues
      };

      // Build payload
      const layerStylePayload: SaveLayerStylePayload = {
        lseCode: this.layerStyle.lseCode,
        sydDefinition: this.layerStyle.sydDefinition,
        listImage: this.layerStyle.listImage
      };

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      if (this.isCreation) {
        this.layerService.createLayerStyle(
          layerStylePayload,
          this.layerStyle.lyrId
        );
      } else {
        this.layerService.updateLayerStyle(
          layerStylePayload,
          this.layerStyle.lseId
        );
      }

      this.reloadNeededInPreviousScreen = true;
    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }

  onClose() {
    this.modalController.dismiss(this.reloadNeededInPreviousScreen);
  }
}
