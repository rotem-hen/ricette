import { Recipe } from 'app/content/interface/recipe.interface';

export interface CategoryModalState {
  categoryNameInput: string;
  color: string;
  options: {
    recipe: Recipe;
    selected: boolean;
  }[];
}
