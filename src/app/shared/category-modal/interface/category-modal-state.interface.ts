import { Recipe } from 'app/content/interface/recipe.interface';

export interface CategoryModalState {
  id: string;
  name: string;
  color: string;
  options: {
    recipe: Recipe;
    selected: boolean;
  }[];
}
