import { RecipeState } from 'app/shared/interface/recipe-state.interface';

export interface RecipesState {
  lastRecipeId: string;
  states: Array<RecipeState>;
}
