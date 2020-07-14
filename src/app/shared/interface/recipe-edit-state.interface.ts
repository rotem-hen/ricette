import { Category } from 'app/content/interface/category.interface';

export interface RecipeEditState {
  id?: string;
  title: string;
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
  newRecipe: boolean;
  options: {
    category: Category;
    selected: boolean;
  }[];
}
