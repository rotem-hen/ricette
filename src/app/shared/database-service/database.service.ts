import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public categories: AngularFirestoreCollection<Category>;
  public recipes: AngularFirestoreCollection<Recipe>;

  constructor(private firestore: AngularFirestore) {
    this.categories = firestore.collection<Category>('categories');
    this.recipes = firestore.collection<Recipe>('recipes');
  }

  public getCategories(): Observable<Category[]> {
    return this.categories.valueChanges({ idField: 'id' });
  }

  public getRecipes(): Observable<Recipe[]> {
    return this.recipes.valueChanges({ idField: 'id' });
  }

  public editCategory(id: string, name: string, color: string): void {
    this.categories.doc(id).update({ name, color });
  }

  public editRecipe(id: string, recipe: Recipe): void {
    this.recipes.doc(id).update({ ...recipe });
  }

  public addCategory(name: string, color: string): void {
    this.categories.add({ name, color });
  }

  public addRecipe(recipe: Recipe): void {
    this.recipes.add({ ...recipe });
  }

  public deleteCategory(id: string): void {
    this.categories.doc(id).delete();
    const query = this.recipes.ref.where('categories', 'array-contains', `/categories/${id}`);
    query.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, ' => ', doc.data());
      });
    });
  }

  public deleteRecipe(id: string): void {
    this.recipes.doc(id).delete();
  }
}
