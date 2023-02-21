export class Accordeon {
  name: string;
  imgSrc: string;
  key: string;
  children?: Accordeon[];
}

export class Dataset {
  [key: string]: Accordeon[];
}

export const DATASET: Dataset = {
  water: [
    {
      name: 'Branchements',
      imgSrc: '',
      key: 'aep_branche',
      children: [],
    },
    {
      name: 'Canalisations',
      imgSrc: '',
      key: 'aep_canalisation',
      children: [],
    },
    {
      name: 'Ouvrages',
      imgSrc: '',
      key: 'aep_ouvrage',
      children: [],
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
        },
        {
          imgSrc: 'assets/img/patrimony/incendie.png',
          name: 'Equipement incendie',
          key: 'aep_defense_incendie'
        },
        {
          imgSrc: 'assets/img/patrimony/comptage_reseau.png',
          name: 'Equipements comptage réseau',
          key: '',
        },
        {
          imgSrc: 'assets/img/patrimony/autre_eq_reseau.png',
          name: 'Autres équipements réseau',
            key: '',
        },
        {
          imgSrc: 'assets/img/patrimony/eq_regulation.png',
          name: 'Equipements régulation',
          key: '',
        },
      ],
    },
  ],
  sanitation: [
    {
      name: 'Branchements',
      imgSrc: '',
      key: 'ass_branche',
      children: [],
    },
    {
      name: 'Collecteurs',
      imgSrc: '',
      key: 'ass_collecteur',
      children: [],
    },
    {
      name: 'Ouvrages',
      imgSrc: '',
      key: 'ass_ouvrage',
      children: [],
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
        },
        {
          imgSrc: 'assets/img/patrimony/regard.png',
          name: 'Regard',
          key: 'ass_regard',
        },
        {
          imgSrc: 'assets/img/patrimony/autre_eq.png',
          name: 'Autre équipements',
          key: '',
        },
      ],
    },
  ],
  favorites: [
    {
      name: 'Assainissement - favoris - 1',
      imgSrc: '',
      key: '',
      children: [],
    },
    {
      name: 'Assainissement - favoris - 2',
      imgSrc: '',
      key: '',
      children: [],
    },
  ],
  details: [
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
            },
            {
              name: 'AEP - Etape de pression',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              key: '',
            },
            {
              name: 'AEP - Unité de distribution',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              key: '',
            },
          ],
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
            },
            {
              name: 'AEP - Cable alimentation',
              imgSrc: 'assets/img/patrimony/detail_cable_alimentation.png',
              key: '',
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
                },
              ],
            },
          ],
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
                    },
                  ],
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
                    },
                  ],
                },
                {
                  name: 'Production/Pompage',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  key: '',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
