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
                imgSrc: 'assets/img/patrimony/aep_vanne/vanne.png',
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
            checked: true,
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
            name: 'Eau Potable',
            imgSrc: 'assets/img/patrimony/detail_secteur.png',
            children: [{
              id: 1,
              name: "AEP - Branchement",
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              layerName: 'aep_branche',
              },
              {
                  id: 2,
                  name: "AEP - Canalisation",
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  layerName: 'aep_canalisation',
              },
              {
                name: 'AEP - Equipement',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                children: [
                  {
                    name: 'AEP - Vanne',
                    imgSrc: 'assets/img/patrimony/aep_vanne/vanne.png',
                    layerName:'aep_vanne',
                    children: [
                      {
                        name: 'Fermée',
                        imgSrc: 'assets/img/patrimony/aep_vanne/vanne_fermee.png',
                        children: [
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_fermee_electro_style',
                            name: 'Electrovanne',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_FERMEE_ELECTRO.png',
                            id: 6,
                            position: 1,
                          },
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_fermee_robinet_style',
                            name: 'Robinet Vanne',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_FERMEE_ROBINET.png',
                            id: 7,
                            position: 2,
                          },
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_fermee_tour_style',
                            name: '1/4 de tour',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_FERMEE_TOUR.png',
                            id: 8,
                            position: 2,
                          },
                        ],
                        id: 5,
                        position: 1,
                      },
                      {
                        name: 'Ouvert',
                        imgSrc: 'assets/img/patrimony/aep_vanne/vanne_ouvert.png',
                        children: [
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_ouvert_electro_style',
                            name: 'Electrovanne',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_OUVERT_ELECTRO.png',
                            id: 10,
                            position: 1,
                          },
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_ouvert_robinet_style',
                            name: 'Robinet Vanne',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_OUVERT_ROBINET.png',
                            id: 11,
                            position: 2,
                          },
                          {
                            layerName:'aep_vanne',
                            styleId:'aep_vanne_ouvert_tour_style',
                            name: '1/4 de tour',
                            imgSrc: 'assets/img/patrimony/aep_vanne/AEP_VANNE_OUVERT_TOUR.png',
                            id: 12,
                            position: 2,
                          },
                        ],
                        id: 9,
                        position: 2,
                      },
                    ],
                    id: 13,
                    position: 1,
                  },
                  {
                    name: 'AEP - Equipement incendie',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    children: [
                      {
                        name: 'Poteau incendie',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 15,
                        position: 1,
                      },
                      {
                        name: 'Bouche incendie',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 16,
                        position: 2,
                      },
                      {
                        name: 'Prise accessoire',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 17,
                        position: 2,
                      },
                    ],
                    id: 14,
                    position: 2,
                  }
                ],
                id: 18,
                position: 1,
              }
            ],
            id: 19,
            position: 1,
          },
          {
            name: 'Assainissement',
            imgSrc: 'assets/img/patrimony/detail_secteur.png',
            children: [
              {
                name: 'ASS - Branchement',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                children: [
                  {
                    name: 'Grille / Avaloir',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 20,
                    position: 1,
                  },
                  {
                    name: 'Caniveau grille',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 21,
                    position: 2,
                  },
                  {
                    name: 'Boîte de branchement',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    id: 22,
                    position: 2,
                  },
                ],
                id: 23,
                position: 1,
              },
              {
                name: 'ASS - Equipement',
                imgSrc: 'assets/img/patrimony/detail_autre.png',
                children: [
                  {
                    name: 'ASS - Regard',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    layerName:'ass_regard',
                    children: [
                      {
                        name: 'Unitaire',
                        layerName:'ass_regard',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        children: [
                          {
                            name: 'Regard',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            layerName:'ass_regard',
                            id: 24,
                            position: 1,
                          },
                          {
                            name: 'Regard borgne',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 25,
                            position: 2,
                          },
                          {
                            name: 'Regard de transfert',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 26,
                            position: 2,
                          },
                        ],
                        id: 27,
                        position: 1,
                      },
                      {
                        name: 'Eaux usées',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        layerName:'ass_regard',
                        children: [
                          {
                            name: 'Regard',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 28,
                            position: 1,
                          },
                          {
                            name: 'Regard borgne',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 29,
                            position: 2,
                          },
                          {
                            name: 'Regard de transfert',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 30,
                            position: 2,
                          },
                        ],
                        id: 31,
                        position: 2,
                      },
                      {
                        name: 'Eaux pluviales',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        children: [
                          {
                            name: 'Regard',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 32,
                            position: 1,
                          },
                          {
                            name: 'Regard borgne',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 33,
                            position: 2,
                          },
                          {
                            name: 'Regard de transfert',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            id: 34,
                            position: 2,
                          },
                        ],
                        id: 35,
                        position: 2,
                      },
                    ],
                    id: 36,
                    position: 1,
                  },
                  {
                    name: 'ASS - Autre équipement',
                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                    children: [
                      {
                        name: 'Raccord',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 37,
                        position: 1,
                      },
                      {
                        name: 'Equipement branche',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 38,
                        position: 2,
                      },
                      {
                        name: 'Equipement disperse',
                        imgSrc: 'assets/img/patrimony/detail_autre.png',
                        id: 39,
                        position: 2,
                      },
                    ],
                    id: 40,
                    position: 2,
                  }
                ],
                id: 41,
                position: 1,
              }
            ],
            id: 42,
            position: 1,
          },
        ]),
      ],
    },
  ],
};
