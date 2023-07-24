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
        },
        {
          url: 'layer-references',
          title: 'Affichage des données attributaires',
        },
        {
          url: 'events',
          title: 'Affichage des évènements',
        },
      ],
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
          title: "Génération d'intervention",
        },
        {
          url: 'report',
          title: 'Compte-rendu',
        },
      ],
    },
    {
      title: 'Gestion des droits',
      items: [
        {
          url: 'profiles',
          title: 'Consultation des profils existants',
          disabled: true,
        },
        {
          url: 'user',
          title: "Création d'un nouvel utilisateur",
          disabled: true,
        },
        {
          url: 'contracts',
          title: 'Gestion des périmètres contractuels',
          disabled: true,
        },
      ],
    },
  ];

  ngOnInit() {}
}
