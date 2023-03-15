import { EquipmentDisplayType, EquipmentSection } from '../../models/equipment.model';

// Uniquely potable water mock data
// Created with https://docs.google.com/spreadsheets/d/1-h20ZiVmILZ4vmkSd0XhjlKkESRA8ZnJPuFIQQk9AJ4/edit#gid=178235457
// And the following "modele_vigie" sheet: https://docs.google.com/spreadsheets/d/1N4Kxm6AezYQ2L17e3cbu5aEW-4Ey--o8sXMkpWGnb04/edit#gid=1312606933
export const sections: EquipmentSection[] = [
  {
    id: 1,
    label: 'Informations génériques',
    key: 'generic-info',
    position: 0,
    elements: [
      {
        id: 2,
        label: 'Identifiant',
        key: 'id',
        position: 0,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 4,
        label: 'Contrat',
        key: 'contrat',
        position: 1,
        display: EquipmentDisplayType.SYNTHETIC,
      },
    ],
  },
  {
    id: 3,
    label: 'Caractéristiques',
    key: 'characteristics',
    position: 1,
    elements: [
      {
        id: 1,
        label: 'Diamètre',
        key: 'diametre',
        position: 0,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 2,
        label: 'Matériau',
        key: 'materiau',
        position: 1,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 3,
        label: 'Fonction',
        key: 'fonction',
        position: 2,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 4,
        label: 'Nature (de réseau)',
        key: 'type_eau',
        position: 3,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 5,
        label: 'Secteur',
        key: 'secteur',
        position: 4,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 6,
        label: 'Ecoulement',
        key: 'ecoulement',
        position: 5,
        display: EquipmentDisplayType.SYNTHETIC,
      },
      {
        id: 7,
        label: 'Etage de pression',
        key: 'etage',
        position: 6,
        display: EquipmentDisplayType.SYNTHETIC,
      },
    ],
  },
  {
    id: 4,
    label: 'Localisation et environnement',
    key: 'location-environment',
    position: 2,
    elements: [
      {
        id: 1,
        label: 'Classe de précision',
        key: 'prec_clas',
        position: 0,
        display: EquipmentDisplayType.SYNTHETIC,
      },
    ],
  },
  {
    id: 5,
    label: 'Informations complémentaires',
    key: 'additional-info',
    position: 3,
    elements: [
      {
        id: 1,
        label: 'Document annexes (Pièce jointe)',
        key: 'document',
        position: 0,
        display: EquipmentDisplayType.SYNTHETIC,
      },
    ],
  },
];
