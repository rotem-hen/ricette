import { DocumentReference } from '@angular/fire/firestore';

export interface Recipe {
  uid?: string;
  id?: string;
  title: string;
  categories: DocumentReference[];
  isFavourite: boolean;
  ingredients: string;
  prep: string;
  duration: number;
  quantity: string;
  link: string;
  image: string;
}
