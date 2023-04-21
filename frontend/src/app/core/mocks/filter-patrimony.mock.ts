import { AccordeonFilter } from '../models/filter/filter-component-models/AccordeonFilter.model';
import { FavoriteFilter } from '../models/filter/filter-component-models/FavoriteFilter.model';
import { ToggleFilter } from '../models/filter/filter-component-models/ToggleFilter.model';
import { TreeFilter } from '../models/filter/filter-component-models/TreeFilter.model';
import { Filter } from '../models/filter/filter.model';

export const patrimonyFilterMock: Filter = {
  id: 1,
  segments: [
    {
      id: 1,
      name: 'Eau Potable',
      position: 1,
      selected: true,
      components: [
        new AccordeonFilter(1, true, 1, [
          {
            id: 2,
            key: 'aep_branche',
            name: 'Branchements',
            value: false,
            position: 1,
          },
          {
            id: 3,
            key: 'aep_canalisation',
            name: 'Canalisations',
            position: 2,
          },
          {
            id: 4,
            key: 'aep_ouvrage',
            name: 'Ouvrages',
            position: 3,
          },
          {
            id: 5,
            name: 'Equipements',
            position: 4,
            children: [
              {
                id: 6,
                imgSrc: 'assets/img/patrimony/vanne.png',
                name: 'Vanne',
                key: 'aep_vanne',
                position: 1,
              },
              {
                id: 7,
                imgSrc: 'assets/img/patrimony/incendie.png',
                name: 'Equipement incendie',
                key: 'aep_defense_incendie',
                position: 2,
              },
              {
                id: 8,
                imgSrc: 'assets/img/patrimony/comptage_reseau.png',
                name: 'Equipements comptage réseau',
                position: 3,
              },
              {
                id: 9,
                imgSrc: 'assets/img/patrimony/autre_eq_reseau.png',
                name: 'Autres équipements réseau',
                position: 4,
              },
              {
                id: 10,
                imgSrc: 'assets/img/patrimony/eq_regulation.png',
                name: 'Autre équipements',
                position: 5,
              },
            ],
          },
        ]),
      ],
    },
    {
      id: 11,
      name: 'Assainissement',
      position: 2,
      selected: false,
      components: [
        new ToggleFilter(1, false, 1, [
          {
            id: 41,
            name: 'Pluviale',
            checked: true,
            position: 1,
            key:'type_eau',
            value:'Eaux pluviales'
          },
          {
            id: 42,
            name: 'Eau usée',
            checked: true,
            position: 2,
            key:'type_eau',
            value:'Eaux usées'
          },
          {
            id: 43,
            name: 'Unitaire',
            checked: false,
            position: 3,
            key:'type_eau',
            value:'Unitaire'
          },
        ],['ass_branche','ass_collecteur','ass_regard']),
        new AccordeonFilter(2, true, 1, [
          {
            id: 12,
            key: 'ass_branche',
            name: 'Branchements',
            position: 1,
          },
          {
            id: 13,
            key: 'ass_collecteur',
            name: 'Collecteurs',  
            position: 2,
          },
          {
            id: 14,
            key: 'ass_ouvrage',
            name: 'Ouvrages',
            position: 3,
          },
          {
            id: 15,
            name: 'Equipements',
            position: 4,
            children: [
              {
                id: 16,
                imgSrc: 'assets/img/patrimony/avaloir.png',
                name: 'Avaloir',
                key: 'ass_avaloir',
                position: 1,
              },
              {
                id: 17,
                imgSrc: 'assets/img/patrimony/regard.png',
                name: 'Regard',
                key: 'ass_regard',
                position: 2,
              },
              {
                id: 18,
                imgSrc: 'assets/img/patrimony/autre_eq.png',
                name: 'Autre équipements',
                position: 3,
              },
            ],
          },
        ]),
      ],
    },
    {
      id: 19,
      name: 'Favoris',
      position: 3,
      selected: false,
      components: [
        new FavoriteFilter(1, false, 1, [
          {
            id: 20,
            position: 1,
            name: 'Eau Potable - favoris - 1',
            segment: 1,
            equipments: [
              {
                id: 2,
                key: 'aep_branche',
              },
              {
                id: 3,
                key: 'aep_canalisation',
              },
              {
                id: 6,
                key: 'aep_vanne',
              },
            ],
          },
          {
            id: 22,
            position: 2,
            name: 'Eau Potable - favoris - 2',
            segment: 1,
            equipments: [
              {
                id: 2,
                key: 'aep_branche',
              },
              {
                id: 3,
                key: 'aep_canalisation',
              },
              {
                id: 6,
                key: 'aep_vanne',
              },
            ],
          },
          {
            id: 23,
            position: 3,
            name: 'Ass - 1',
            segment: 11,
            equipments: [
                {
                  id: 12,
                  key: 'ass_branche',
                },
                {
                  id: 14,
                  key: 'ass_ouvrage',
                },
              ],
          },
        ]),
      ],
    },
    {
      id: 24,
      name: 'details',
      position: 4,
      selected: false,
      components: [
        new TreeFilter(1, true, 1, [
          {
            name: 'Réseau AEP',
            imgSrc: 'assets/img/patrimony/detail_secteur.png',
            children: [
              {
                name: 'Unité fonctionelle',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                key: '',
                children: [
                  {
                    name: 'AEP - Secteur',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 25,
                    position: 1,
                  },
                  {
                    name: 'AEP - Etape de pression',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 26,
                    position: 2,
                  },
                  {
                    name: 'AEP - Unité de distribution',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 27,
                    position: 3,
                  },
                ],
                id: 1,
                position: 1,
              },
              {
                name: 'Alimentation Externe',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                children: [
                  {
                    name: 'AEP - Cables abandonnés',
                    imgSrc: 'assets/img/patrimony/detail_cables_abandonnes.png',
                    id: 27,
                    position: 1,
                  },
                  {
                    name: 'AEP - Cable alimentation',
                    imgSrc:
                      'assets/img/patrimony/detail_cable_alimentation.png',
                    id: 28,
                    position: 2,
                  },
                  {
                    name: 'AEP - Alimentation externe',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    children: [
                      {
                        name: 'No data',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 29,
                        position: 3,
                      },
                    ],
                    id: 30,
                    position: 3,
                  },
                ],
                id: 31,
                position: 2,
              },
              {
                name: 'Ouvrage',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                children: [
                  {
                    name: 'AEP - Ouvrage',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    children: [
                      {
                        name: 'Captage/Forage',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        children: [
                          {
                            name: 'No data',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 32,
                            position: 1,
                          },
                        ],
                        id: 33,
                        position: 1,
                      },
                      {
                        name: 'Réservoirs',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        children: [
                          {
                            name: 'No data',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 34,
                            position: 1,
                          },
                        ],
                        id: 35,
                        position: 2,
                      },
                      {
                        name: 'Production/Pompage',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 36,
                        position: 3,
                      },
                    ],
                    id: 37,
                    position: 1,
                  },
                ],
                id: 38,
                position: 3,
              },
            ],
            id: 39,
            position: 1,
          },
        ]),
      ],
    },
  ],
};
