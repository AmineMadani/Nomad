export class Accordeon {
  name: string;
  imgSrc: string;
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
      children: [],
    },
    {
      name: 'Canalisations',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Ouvrages',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Equipements',
      imgSrc: '',
      children: [
        {
          imgSrc: 'assets/img/patrimony/vanne.png',
          name: 'Vanne',
        },
        {
          imgSrc: 'assets/img/patrimony/incendie.png',
          name: 'Equipement incendie',
        },
        {
          imgSrc: 'assets/img/patrimony/comptage_reseau.png',
          name: 'Equipements comptage réseau',
        },
        {
          imgSrc: 'assets/img/patrimony/autre_eq_reseau.png',
          name: 'Autres équipements réseau',
        },
        {
          imgSrc: 'assets/img/patrimony/eq_regulation.png',
          name: 'Equipements régulation',
        },
      ],
    },
  ],
  sanitation: [
    {
      name: 'Branchements',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Collecteurs',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Ouvrages',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Equipements',
      imgSrc: '',
      children: [
        {
          imgSrc: 'assets/img/patrimony/avaloir.png',
          name: 'Avaloir',
        },
        {
          imgSrc: 'assets/img/patrimony/regard.png',
          name: 'Regard',
        },
        {
          imgSrc: 'assets/img/patrimony/autre_eq.png',
          name: 'Autre équipements',
        },
      ],
    },
  ],
  favorites: [
    {
      name: 'Assainissement - favoris - 1',
      imgSrc: '',
      children: [],
    },
    {
      name: 'Assainissement - favoris - 2',
      imgSrc: '',
      children: [],
    },
  ],
  details: [
    {
      name: 'Réseau AEP',
      imgSrc: 'assets/img/patrimony/detail_secteur.png',
      children: [
        {
          name: 'Unité fonctionelle',
          imgSrc: 'assets/img/patrimony/detail_autre.png',
          children: [
            {
              name: 'AEP - Secteur',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
            },
            {
              name: 'AEP - Etape de pression',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
            },
            {
              name: 'AEP - Unité de distribution',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
            },
          ],
        },
        {
          name: 'Alimentation Externe',
          imgSrc: 'assets/img/patrimony/detail_autre.png',
          children: [
            {
              name: 'AEP - Cables abandonnés',
              imgSrc: 'assets/img/patrimony/detail_cables_abandonnes.png',
            },
            {
              name: 'AEP - Cable alimentation',
              imgSrc: 'assets/img/patrimony/detail_cable_alimentation.png',
            },
            {
              name: 'AEP - Alimentation externe',
              imgSrc: 'assets/img/patrimony/detail_autre.png',
              children: [
                {
                  name: 'No data',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                },
              ],
            },
          ],
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
                    },
                  ],
                },
                {
                  name: 'Réservoirs',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                  children: [
                    {
                      name: 'No data',
                      imgSrc: 'assets/img/patrimony/detail_autre.png',
                    },
                  ],
                },
                {
                  name: 'Production/Pompage',
                  imgSrc: 'assets/img/patrimony/detail_autre.png',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
