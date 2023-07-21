import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-layer-style',
  templateUrl: './layer-style.component.html',
  styleUrls: ['./layer-style.component.scss'],
})
export class LayerStyleComponent implements OnInit {

  constructor() { }

  form: FormGroup;
  @Input("lseId") lseId;

  async ngOnInit() {
    this.form = new FormGroup({
      lseCode: new FormControl(null, Validators.required),
      sydDefinition: new FormControl(null, Validators.required),
    });


    console.log(this.lseId);
  }

  onFileChanged(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Ici, vous pouvez faire ce que vous voulez avec chaque fichier
      console.log(file);
    }
  }

  save() {
    console.log('save');
  }

  close() {
    console.log('close');
  }
}
