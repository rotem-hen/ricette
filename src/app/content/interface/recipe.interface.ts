export interface Recipe {
  id: string;
  title: string;
  categories: string[];
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
}
