import { AccordeonData } from "./filter-models/filter-component-models/AccordeonFilter.model";

export interface Favorite {
    name: string;
    favoriteItems: FavoriteItem[];
}

export interface FavoriteItem {
    segment: string;
    parent: string;
    child: string[];
}

export interface FavoriteSelection {
    typeAction: string;
    data: AccordeonData;
}

export const favorites: Favorite[] = [{
    name: 'eau - favoris - 1',
    favoriteItems: [
        {
            segment: 'water',
            parent: 'Branchements',
            child: []
        },
        {
            segment: 'water',
            parent: 'Equipements',
            child: []
        }
    ]
},
{
    name: 'Assainissement - favoris - 1',
    favoriteItems: [
        {
            segment: 'sanitation',
            parent: 'Branchements',
            child: []
        }
    ]
}];