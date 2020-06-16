import { Category } from '../interface/category.interface';
import { Recipe } from '../interface/recipe.interface';

export const SpecialCategories = {
  UNCATEGORIZED: '0',
  ALL: '1000',
  FAVORITES: '2000',
  SEARCH_RESULTS: '3000'
};

export const categoryViews: Category[] = [
  {
    uid: null,
    id: SpecialCategories.UNCATEGORIZED,
    name: 'ללא קטגוריה',
    color: '#b7b7b7',
    hidden: false,
    selector: (recipe: Recipe): boolean => !recipe.categories.length
  },
  {
    uid: null,
    id: SpecialCategories.ALL,
    name: 'כל המתכונים',
    color: '#b7b7b7',
    hidden: true,
    selector: (): boolean => true
  },
  {
    uid: null,
    id: SpecialCategories.FAVORITES,
    name: 'מועדפים',
    color: '#b7b7b7',
    hidden: true,
    selector: (recipe: Recipe): boolean => recipe.isFavourite
  },
  {
    uid: null,
    id: SpecialCategories.SEARCH_RESULTS,
    name: 'תוצאות חיפוש',
    color: '#b7b7b7',
    hidden: true,
    selector: (): boolean => true
  }
];
