import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  constructor() { }

  menuItems = [
    {
      title: 'Généralités',
      items: [
        {
          url: 'patrimony',
          title: 'Affichage patrimoine',
        },
        {
          url: 'layer-references',
          title: 'Affichage des données attributaires',
        },
        {
          url: 'events',
          title: 'Affichage des évènements',
        },
      ]
    },
    {
      title: 'Paramétrage par contact',
      items: [
        {
          url: 'perimeter',
          title: 'Périmètre',
        },
        {
          url: 'workorder',
          title: 'Génération d\intervention',
        },
        {
          url: 'report',
          title: 'Compte-rendu',
        },
      ]
    },
  ];

  ngOnInit() {}
}
