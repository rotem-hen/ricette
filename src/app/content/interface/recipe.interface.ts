export interface Recipe {
  id?: string;
  title: string;
  categories: { id: string }[];
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
}
