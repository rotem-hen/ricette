import { Recipe } from './recipe.interface';

export interface Category {
  id: number;
  name: string;
  color: string;
  hidden?: boolean;
  selector?: (recipe: Recipe) => boolean;
}