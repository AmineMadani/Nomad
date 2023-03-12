import { AccordeonFilter } from "../models/filter-models/filter-component-models/AccordeonFilter.model";
import { FavoriteFilter } from "../models/filter-models/filter-component-models/FavoriteFilter.model";
import { TreeData, TreeFilter } from "../models/filter-models/filter-component-models/TreeFilter.model";
import { Filter } from "../models/filter-models/filter.model";

export const patrimonyFilterMock: Filter = {
    id: 1,
    segments: [
        {
            id: 1,
            name: 'Eau Potable',
            position: 1,
            selected: true,
            components: [new AccordeonFilter(1, true, 1, [
                {
                    id: 1,
                    key: 'aep_branche',
                    name: 'Branchements',
                    value: true,
                    position: 1
                },
                {
                    id: 2,
                    key: 'aep_canalisation',
                    name: 'Canalisations',
                    position: 2
                },
                {
                    id: 3,
                    key: 'aep_ouvrage',
                    name: 'Ouvrages',
                    position: 3
                },
                {
                    id: 4,
                    name: 'Equipements',
                    position: 4,
                    children: [
                        {
                            id: 5,
                            imgSrc: 'assets/img/patrimony/vanne.png',
                            name: 'Vanne',
                            key: 'aep_vanne',
                            position: 1
                        },
                        {
                            id: 6,
                            imgSrc: 'assets/img/patrimony/incendie.png',
                            name: 'Equipement incendie',
                            key: 'aep_defense_incendie',
                            position: 2
                        },
                        {
                            id: 7,
                            imgSrc: 'assets/img/patrimony/comptage_reseau.png',
                            name: 'Equipements comptage réseau',
                            position: 3
                        },
                        {
                            id: 8,
                            imgSrc: 'assets/img/patrimony/autre_eq_reseau.png',
                            name: 'Autres équipements réseau',
                            position: 4
                        },
                        {
                            id: 9,
                            imgSrc: 'assets/img/patrimony/eq_regulation.png',
                            name: 'Equipements régulation',
                            position: 5
                        },
                    ]
                }
            ])]
        },
        {
            id: 2,
            name: 'Assainissement',
            position: 2,
            selected: false,
            components: [new AccordeonFilter(1, true, 1, [
                {
                    id: 1,
                    key: 'ass_branche',
                    name: 'Branchements',
                    position: 1
                },
                {
                    id: 2,
                    key: 'ass_collecteur',
                    name: 'Canalisations',
                    position: 2
                },
                {
                    id: 3,
                    key: 'ass_ouvrage',
                    name: 'Ouvrages',
                    position: 3
                },
                {
                    id: 4,
                    name: 'Equipements',
                    position: 4,
                    children: [
                        {
                            id: 5,
                            imgSrc: 'assets/img/patrimony/avaloir.png',
                            name: 'Avaloir',
                            key: 'ass_avaloir',
                            position: 1
                        },
                        {
                            id: 6,
                            imgSrc: 'assets/img/patrimony/regard.png',
                            name: 'Regard',
                            key: 'ass_regard',
                            position: 2
                        },
                        {
                            id: 7,
                            imgSrc: 'assets/img/patrimony/autre_eq.png',
                            name: 'Autre équipements',
                            position: 3
                        }
                    ]
                }
            ])]
        },
        {
            id: 3,
            name: 'Favoris',
            position: 3,
            selected: false,
            components: [new FavoriteFilter(1, false, 1, [
                {
                    id: 1,
                    name: 'eau - favoris - 1',
                    position: 1,
                    dataSave: []
                },
                {
                    id: 1,
                    name: 'Assainissement - favoris - 1',
                    position: 2,
                    dataSave: []
                }

            ])]
        },
        {
            id: 4,
            name: 'details',
            position: 4,
            selected: false,
            components: [new TreeFilter(1, false, 1, [
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
                                    id: 1,
                                    position: 1
                                },
                                {
                                    name: 'AEP - Etape de pression',
                                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                                    id: 2,
                                    position: 2
                                },
                                {
                                    name: 'AEP - Unité de distribution',
                                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                                    id: 3,
                                    position: 3
                                },
                            ],
                            id: 1,
                            position: 1
                        },
                        {
                            name: 'Alimentation Externe',
                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                            children: [
                                {
                                    name: 'AEP - Cables abandonnés',
                                    imgSrc: 'assets/img/patrimony/detail_cables_abandonnes.png',
                                    id:1,
                                    position:1
                                },
                                {
                                    name: 'AEP - Cable alimentation',
                                    imgSrc: 'assets/img/patrimony/detail_cable_alimentation.png',
                                    id:2,
                                    position:2
                                },
                                {
                                    name: 'AEP - Alimentation externe',
                                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                                    children: [
                                        {
                                            name: 'No data',
                                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                                            id:3,
                                            position:3
                                        },
                                    ],
                                    id:3,
                                    position:3
                                },
                            ],
                            id:2,
                            position:2
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
                                                    id:1,
                                                    position:1
                                                },
                                            ],
                                            id:1,
                                            position:1
                                        },
                                        {
                                            name: 'Réservoirs',
                                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                                            children: [
                                                {
                                                    name: 'No data',
                                                    imgSrc: 'assets/img/patrimony/detail_autre.png',
                                                    id:1,
                                                    position:1
                                                },
                                            ],
                                            id:2,
                                            position:2
                                        },
                                        {
                                            name: 'Production/Pompage',
                                            imgSrc: 'assets/img/patrimony/detail_autre.png',
                                            id:3,
                                            position:3
                                        },
                                    ],
                                    id:1,
                                    position:1
                                },
                            ],
                            id:3,
                            position:3
                        },
                    ],
                    id:1,
                    position:1
                },
            ])]
        }
    ]
}