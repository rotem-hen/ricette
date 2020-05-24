import { Recipe } from './recipe.interface';
import { DocumentReference } from 'angularfire2/firestore';

export interface Category {
  uid?: DocumentReference;
  id?: string;
  name: string;
  color: string;
  hidden?: boolean;
  selector?: (recipe: Recipe) => boolean;
}
