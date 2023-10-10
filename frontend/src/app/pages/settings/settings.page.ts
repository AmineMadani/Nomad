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
          url: 'asset',
          title: 'Affichage patrimoine',
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
        {
          url: 'reports',
          title: 'Personnalisation des formulaires de comptes-rendus',
        },
        {
          url: 'report-questions',
          title: 'Personnalisation des questions de comptes-rendus',
        },
      ],
    },
    {
      title: 'Paramétrage par contact',
      items: [
        {
          url: 'perimeters',
          title: 'Périmètre',
          disabled: true,
        },
        {
          url: 'workorders',
          title: "Génération d'intervention",
          disabled: true,
        },
        {
          url: 'reports',
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
          title: 'Gestion des utilisateurs',
        },
        {
          url: 'permissions',
          title: 'Gestion des permissions',
        },
      ],
    },
  ];

  ngOnInit() {}
}
