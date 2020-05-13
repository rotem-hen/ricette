import { Category } from '../interface/category.interface';
import { Recipe } from '../interface/recipe.interface';

export enum CategoriesIds {
  UNCATEGORIZED = '0',
  ALL = '1000',
  FAVORITES = '2000',
  SEARCH_RESULTS = '3000'
}

export const categoryViews: Category[] = [
  {
    id: CategoriesIds.UNCATEGORIZED,
    name: 'ללא קטגוריה',
    color: '#b7b7b7',
    hidden: false,
    selector: (recipe: Recipe): boolean => !recipe.categories.length
  },
  {
    id: CategoriesIds.ALL,
    name: 'כל המתכונים',
    color: '#b7b7b7',
    hidden: true,
    selector: (): boolean => true
  },
  {
    id: CategoriesIds.FAVORITES,
    name: 'מועדפים',
    color: '#b7b7b7',
    hidden: true,
    selector: (recipe: Recipe): boolean => recipe.isFavourite
  },
  {
    id: CategoriesIds.SEARCH_RESULTS,
    name: 'תוצאות חיפוש',
    color: '#b7b7b7',
    hidden: true,
    selector: (): boolean => true
  }
];
