export interface Recipe {
  id: number;
  title: string;
  categories: number[];
  isFavourite: boolean;
  ingredients: string[];
  prep: string[];
}