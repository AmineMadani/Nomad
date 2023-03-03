import { DisplayType, Section } from './equipment-drawer.model';

export const sections: Section[] = [
  {
    label: 'Informations génériques',
    key: 'generic-info',
    position: 0,
    elements: [
      {
        label: 'Identifiant',
        key: 'id',
        position: 0,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Type',
        key: 'type',
        position: 1,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Contrat',
        key: 'contrat',
        position: 2,
        display: DisplayType.SYNTHETIC,
      },
    ],
  },
  {
    label: 'Caractéristiques',
    key: 'characteristics',
    position: 1,
    elements: [
      {
        label: 'Diamètre',
        key: 'diametre',
        position: 0,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Matériau',
        key: 'material',
        position: 1,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Forme',
        key: 'shape',
        position: 2,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Longueur SIG',
        key: 'length',
        position: 3,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Gestionnaire',
        key: 'manager',
        position: 4,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Sensibilité',
        key: 'sensitivity',
        position: 5,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Ecoulement',
        key: 'flow',
        position: 6,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Matériau de réhabilitation',
        key: 'rehabilitationMaterial',
        position: 7,
        display: DisplayType.SYNTHETIC,
      },
    ],
  },
  {
    label: 'Localisation et environnement',
    key: 'location-environment',
    position: 2,
    elements: [
      {
        label: 'Classe de précision',
        key: 'precisionClass',
        position: 0,
        display: DisplayType.SYNTHETIC,
      },
      {
        label: 'Emplacement',
        key: 'rue',
        position: 1,
        display: DisplayType.SYNTHETIC,
      },
    ],
  },
  {
    label: 'Informations complémentaires',
    key: 'additional-info',
    position: 3,
    elements: [
      {
        label: 'Document annexes (Pièce jointe)',
        key: 'document',
        position: 0,
        display: DisplayType.SYNTHETIC,
      },
    ],
  },
];
