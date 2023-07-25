import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { Layer, LayerStyle, LayerStyleDetail, StyleImage } from 'src/app/core/models/layer.model';
import { LayerStyleDataService } from 'src/app/core/services/dataservices/layer-style.dataservice';
import { Navigation } from 'swiper';

@Component({
  selector: 'app-layer-style',
  templateUrl: './layer-style.component.html',
  styleUrls: ['./layer-style.component.scss'],
})
export class LayerStyleComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private layerStyleDataService: LayerStyleDataService
  ) { }

  @Input("lseId") lseId;
  @Input("parentLayer") parentLayer: Layer;

  public isCreation: boolean = true;

  public form: FormGroup;
  public layerStyle: LayerStyleDetail;
  public files: File[] = [];

  public swiperModules = [Navigation];
  public opts: {
    slidesPerView: true
  }

  async ngOnInit() {
    this.isCreation = !this.lseId;

    this.form = new FormGroup({
      lyrTableName: new FormControl({ value: null, disabled: true }, Validators.required),
      lseCode: new FormControl(null, Validators.required),
      sydDefinition: new FormControl(null, Validators.required),
    });

    if (!this.isCreation) {
      this.layerStyleDataService.getLayerStyleById(this.lseId)
        .subscribe((lse: LayerStyleDetail) => {
          this.layerStyle = lse;
          this.layerStyle.listImage = lse.listImage;

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
    this.files = event.target.files;
    this.layerStyle.listImage = [];

    Array.from(this.files).forEach(file => {
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


  save() {
    if (this.form.valid) {
      const formValues = this.form.value;
      console.log(formValues);

      this.layerStyle = {
        ...this.layerStyle,
        ...formValues
      };

      console.log(this.layerStyle);

      // Save in the database
      // A toast is automatically showed to the user when the api call is done.
      if (this.isCreation) {
        this.layerStyleDataService.createLayerStyle(this.layerStyle).subscribe();
      } else {
        this.layerStyleDataService.updateLayerStyle(this.layerStyle).subscribe();
      }


    } else {
      // Permit to show the current form errors to the user
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.modalController.dismiss();
  }
}
