import { DocumentReference } from '@angular/fire/firestore';

export interface Recipe {
  uid?: string;
  id?: string;
  title: string;
  categories: DocumentReference[];
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  image: string;
}
