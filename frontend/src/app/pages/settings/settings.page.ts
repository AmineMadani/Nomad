import { Component, OnInit } from '@angular/core';

interface MenuItems {
  title: string;
  items: { url: string; title: string; disabled?: boolean }[];
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  constructor() {}

  public menuItems: MenuItems[] = [
    {
      title: 'Généralités',
      items: [
        {
          url: 'patrimony',
          title: 'Affichage patrimoine',
          disabled: true,
        },
        {
          url: 'layer-references',
          title: 'Affichage des données attributaires',
        },
        {
          url: 'events',
          title: 'Affichage des évènements',
          disabled: true,
        },
        {
          url: 'layer-styles',
          title: 'Personnalisation des styles par défaut',
        },
      ]
    },
    {
      title: 'Paramétrage par contact',
      items: [
        {
          url: 'perimeter',
          title: 'Périmètre',
          disabled: true,
        },
        {
          url: 'workorder',
          title: "Génération d'intervention",
          disabled: true,
        },
        {
          url: 'report',
          title: 'Compte-rendu',
          disabled: true,
        },
      ],
    },
    {
      title: 'Gestion des droits',
      items: [
        {
          url: 'users',
          title: "Gestion des utilisateurs",
        },
        {
          url: 'profiles',
          title: 'Gestion des profils',
          disabled: true,
        },
      ],
    },
  ];

  ngOnInit() {}
}
