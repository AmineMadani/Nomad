export class Segment {
  multiple: boolean;
  type: string;
  position: number;
  mode?: "md" | "ios";
  saveableFavorite: boolean;
  label: string;
  data: AccordeonData[];
}
export class AccordeonData {
  name: string;
  imgSrc: string;
  key: string;
  segmentParent?: string;
  children?: AccordeonData[];
  selected: boolean = false;
  isInderminate: boolean = false;
}
export class AccordeonSelection {
  segment: string;
  type: string;
  action: string;
  data: AccordeonData;
  isChild: boolean;
  parent: AccordeonData | null;
}

export const data: Map<string,Segment> =  new Map<string, Segment>([
  ['water', {
    type: "accordeon",
    multiple: true,
    position: 1,
    saveableFavorite: true,
    label: 'Eau Potable',
    data: [
      {
        name: 'Branchements',
        imgSrc: '',
        key: 'aep_branche',
        children: [],
        selected: false,
        isInderminate: false
      },
      {
        name: 'Canalisations',
        imgSrc: '',
        key: 'aep_canalisation',
        children: [],
        selected: false,
        isInderminate: false
      },
      {
        name: 'Ouvrages',
        imgSrc: '',
        key: 'aep_ouvrage',
        children: [],
        selected: false,
        isInderminate: false
      },
      {
        name: 'Equipements',
        imgSrc: '',
        key: '',
        children: [
          {
            imgSrc: 'assets/img/patrimony/vanne.png',
            name: 'Vanne',
            key: 'aep_vanne',
            selected: false,
            isInderminate: false
          },
          {
            imgSrc: 'assets/img/patrimony/incendie.png',
            name: 'Equipement incendie',
            key: 'aep_defense_incendie',
            selected: false,
            isInderminate: false
          },
          {
            imgSrc: 'assets/img/patrimony/comptage_reseau.png',
            name: 'Equipements comptage réseau',
            key: '',
            selected: false,
            isInderminate: false
          },
          {
            imgSrc: 'assets/img/patrimony/autre_eq_reseau.png',
            name: 'Autres équipements réseau',
            key: '',
            selected: false,
            isInderminate: false
          },
          {
            imgSrc: 'assets/img/patrimony/eq_regulation.png',
            name: 'Equipements régulation',
            key: '',
            selected: false,
            isInderminate: false
          },
        ],
        selected: false,
        isInderminate: false
      }
    ]
  }],
  [
    'sanitation', {
      type: "accordeon",
      multiple: true,
      label: "Assainissement",
      saveableFavorite: true,
      position: 2,
      data: [
        {
          name: 'Branchements',
          imgSrc: '',
          key: 'ass_branche',
          children: [],
          selected: false,
          isInderminate: false
        },
        {
          name: 'Collecteurs',
          imgSrc: '',
          key: 'ass_collecteur',
          children: [],
          selected: false,
          isInderminate: false
        },
        {
          name: 'Ouvrages',
          imgSrc: '',
          key: 'ass_ouvrage',
          children: [],
          selected: false,
          isInderminate: false
        },
        {
          name: 'Equipements',
          imgSrc: '',
          key: '',
          children: [
            {
              imgSrc: 'assets/img/patrimony/avaloir.png',
              name: 'Avaloir',
              key: 'ass_avaloir',
              selected: false,
              isInderminate: false
            },
            {
              imgSrc: 'assets/img/patrimony/regard.png',
              name: 'Regard',
              key: 'ass_regard',
              selected: false,
              isInderminate: false
            },
            {
              imgSrc: 'assets/img/patrimony/autre_eq.png',
              name: 'Autre équipements',
              key: '',
              selected: false,
              isInderminate: false
            },
          ],
          selected: false,
          isInderminate: false
        },
      ]
    }
  ],
  [
    'favorites', {
      type: "favorite",
      mode: "ios",
      label: "Favoris",
      position: 3,
      saveableFavorite: false,
      multiple: false,
      data: [
        {
          name: 'eau - favoris - 1',
          imgSrc: '',
          key: '',
          children: [],
          segmentParent: 'water',
          selected: false,
          isInderminate: false
        },
        {
          name: 'Assainissement - favoris - 1',
          imgSrc: '',
          key: '',
          children: [],
          segmentParent: 'sanitation',
          selected: false,
          isInderminate: false
        }
      ]
    }
  ],
  [
    'details', {
      type: "tree",
      multiple: false,
      label: "Détails",
      saveableFavorite: true,
      position: 4,
      data: [
        {
          name: 'Réseau AEP',
          imgSrc: 'assets/img/patrimony/detail_secteur.png',
          key: '',
          children: [
            {
              name: 'Unité fonctionelle',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              key: '',
              children: [
                {
                  name: 'AEP - Secteur',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                  selected: false,
                  isInderminate: false
                },
                {
                  name: 'AEP - Etape de pression',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                  selected: false,
                  isInderminate: false
                },
                {
                  name: 'AEP - Unité de distribution',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                  selected: false,
                  isInderminate: false
                },
              ],
              selected: false,
              isInderminate: false
            },
            {
              name: 'Alimentation Externe',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              key: '',
              children: [
                {
                  name: 'AEP - Cables abandonnés',
                  imgSrc: 'assets/img/patrimony/detail_cables_abandonnes.png',
                  key: '',
                  selected: false,
                  isInderminate: false
                },
                {
                  name: 'AEP - Cable alimentation',
                  imgSrc: 'assets/img/patrimony/detail_cable_alimentation.png',
                  key: '',
                  selected: false,
                  isInderminate: false
                },
                {
                  name: 'AEP - Alimentation externe',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                  children: [
                    {
                      name: 'No data',
                      imgSrc: 'assets/img/patrimony/detail_autre.png',
                      key: '',
                      selected: false,
                      isInderminate: false
                    },
                  ],
                  selected: false,
                  isInderminate: false
                },
              ],
              selected: false,
              isInderminate: false
            },
            {
              name: 'Ouvrage',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              key: '',
              children: [
                {
                  name: 'AEP - Ouvrage',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                  children: [
                    {
                      name: 'Captage/Forage',
                      imgSrc: 'assets/img/patrimony/detail_autre.png',
                      key: '',
                      children: [
                        {
                          name: 'No data',
                          imgSrc: 'assets/img/patrimony/detail_autre.png',
                          key: '',
                          selected: false,
                          isInderminate: false
                        },
                      ],
                      selected: false,
                      isInderminate: false
                    },
                    {
                      name: 'Réservoirs',
                      imgSrc: 'assets/img/patrimony/detail_autre.png',
                      key: '',
                      children: [
                        {
                          name: 'No data',
                          imgSrc: 'assets/img/patrimony/detail_autre.png',
                          key: '',
                          selected: false,
                          isInderminate: false
                        },
                      ],
                      selected: false,
                      isInderminate: false
                    },
                    {
                      name: 'Production/Pompage',
                      imgSrc: 'assets/img/patrimony/detail_autre.png',
                      key: '',
                      selected: false,
                      isInderminate: false
                    },
                  ],
                  selected: false,
                  isInderminate: false
                },
              ],
              selected: false,
              isInderminate: false
            },
          ],
          selected: false,
          isInderminate: false
        },
      ]
    }
  ]
]);