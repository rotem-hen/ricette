import { Category } from '../interface/category.interface';

export enum CategoriesIds {
  UNCATEGORIZED = 0,
  ALL = 1000,
  FAVORITES = 2000
}

export const categoryViews: Category[] = [
  {
    id: CategoriesIds.UNCATEGORIZED,
    name: 'ללא קטגוריה',
    color: '#b7b7b7',
    hidden: false
  },
  {
    id: CategoriesIds.ALL,
    name: 'כל המתכונים',
    color: '#b7b7b7',
    hidden: true
  },
  {
    id: CategoriesIds.FAVORITES,
    name: 'מועדפים',
    color: '#b7b7b7',
    hidden: true
  }
];
