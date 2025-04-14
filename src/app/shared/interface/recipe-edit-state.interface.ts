import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';

export interface RecipeEditState {
  id?: string;
  title: string;
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  link: string;
  duration: number;
  quantity: string;
  image: string;
  newRecipe: boolean;
  options: {
    category: Category;
    selected: boolean;
  }[];
  relatedRecipes: {
    recipe: Recipe;
    selected: boolean;
  }[];
}
