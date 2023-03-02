import { Section } from './equipment-drawer.model';

export const sections: Section[] = [
  {
    title: 'Informations génériques',
    elements: [
      { field: 'Identifiant', key: 'id' },
      { field: 'Type', key: 'id' },
      { field: 'Contrat', key: 'id' },
    ],
  },
  {
    title: 'Caractéristiques',
    elements: [
      { field: 'Diamètre', key: 'id' },
      { field: 'Matériau', key: 'id' },
      { field: 'Forme', key: 'id' },
      { field: 'Longueur SIG', key: 'id' },
      { field: 'Gestionnaire', key: 'id' },
      { field: 'Sensibilité', key: 'id' },
      { field: 'Ecoulement', key: 'id' },
      { field: 'Matériau de réhabilitation', key: 'id' },
    ],
  },
  {
    title: 'Localisation et environnement',
    elements: [
      { field: 'Classe de précision', key: 'id' },
      { field: 'Emplacement', key: 'id' },
    ],
  },
  {
    title: 'Informations complémentaires',
    elements: [{ field: 'Document annexes (Pièce jointe)', key: 'id' }],
  },
];
