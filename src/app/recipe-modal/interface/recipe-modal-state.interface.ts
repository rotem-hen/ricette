import { Category } from 'app/content/interface/category.interface';

export interface RecipeModalState {
  title: string;
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
  options: {
    category: Category;
    selected: boolean;
  }[];
}
