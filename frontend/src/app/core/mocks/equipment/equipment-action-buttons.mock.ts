import { EquipmentActionButton } from '../../models/equipment.model';

export const actionButtons: EquipmentActionButton[] = [
  {
    id: 1,
    icon: 'person-circle-outline',
    label: 'Déclencher une intervention',
    position: 0,
    onClick: () => {
      // TODO: Trigger an intervention
    },
  },
  {
    id: 2,
    icon: 'pencil-outline',
    label: 'Compte-rendu',
    position: 1,
    onClick: () => {
      // TODO: Generate a report
    },
  },
  {
    id: 3,
    icon: 'alert-circle',
    label: "Demande d'intervention",
    position: 2,
    onClick: () => {
      // TODO: Request an intervention
    },
  },
  {
    id: 4,
    icon: 'add',
    label: 'Ajouter un programme',
    position: 3,
    onClick: () => {
      // TODO: Add a program
    },
  },
  {
    id: 5,
    icon: 'reload',
    label: 'Mettre à jour',
    position: 4,
    onClick: () => {
      // TODO: Launch an update
    },
  },
];
