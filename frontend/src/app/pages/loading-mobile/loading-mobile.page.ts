import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from 'src/app/core/services/preference.service';

@Component({
  selector: 'app-loading-mobile',
  templateUrl: './loading-mobile.page.html',
  styleUrls: ['./loading-mobile.page.scss'],
})
export class LoadingMobilePage implements OnInit {

  public buffer = 0.1;
  public progress = 0;
  public title:string;
  
  public test:string[]=[
    'Téléchargement des reférentiels...',
    'Téléchargement des index de votre périmètre...',
    'Téléchargement des canalisations de votre périmètre...',
    'Téléchargement des vannes de votre périmètre...',
    'Téléchargement des ouvrages de votre périmètre...',
    'Téléchargement des collecteurs de votre périmètre...',
    'Téléchargement des Branchements de votre périmètre...',
    'Téléchargement des équipements incendie de votre périmètre...',
    'Téléchargement des regards de votre périmètre...',
    'Téléchargement des avaloir de votre périmètre...'
  ]

  constructor(
    private route: Router,
    private preferenceService: PreferenceService
  ) {}

  ngOnInit(): void {
    let i = 0;
    setInterval(() => {
      this.buffer += 0.1;
      this.progress += 0.1;

      this.title = this.test[i];
      i++;

      // Reset the progress bar when it reaches 100%
      // to continuously show the demo
      if (this.progress > 1) {
        this.preferenceService.setPreference("loadedApp","true").then(() => {
          this.route.navigate(["/home"]);
          this.buffer += 0.1;
          this.progress += 0.1;
        })
      }
    }, 1000);
  }

}
