import { DocumentReference } from 'angularfire2/firestore';

export interface Recipe {
  id?: string;
  title: string;
  categories: DocumentReference[];
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
}
