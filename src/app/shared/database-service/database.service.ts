import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, DocumentData } from 'angularfire2/firestore';
import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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

  public async addCategory(name: string, color: string): Promise<string> {
    const newCategoryRef = await this.categories.add({ name, color });
    return new Promise(resolve => resolve(newCategoryRef.id));
  }

  public async addRecipe(recipe: Recipe): Promise<string> {
    const newRecipeRef = await this.recipes.add({ ...recipe });
    return new Promise(resolve => resolve(newRecipeRef.id));
  }

  public deleteCategory(id: string): void {
    const categoryRef = this.categories.doc(id);
    categoryRef.delete();

    const query = this.recipes.ref.where('categories', 'array-contains', categoryRef.ref);
    query.get().then(recipes => {
      recipes.forEach(doc => {
        this.removeCategoryFromRecipeWithDoc(doc, id);
      });
    });
  }

  public deleteRecipe(id: string): void {
    this.recipes.doc(id).delete();
  }

  public addCategoryToRecipe(recipeId, categoryId): void {
    const categoryRef = this.getCategoryRef(categoryId);
    this.recipes
      .doc(recipeId)
      .get()
      .pipe(take(1))
      .subscribe(doc => {
        const categories = doc.data().categories;
        categories.push(categoryRef);
        doc.ref.update({ categories });
      });
  }

  public removeCategoryFromRecipe(recipeId, categoryId): void {
    this.recipes
      .doc(recipeId)
      .get()
      .pipe(take(1))
      .subscribe(doc => {
        this.removeCategoryFromRecipeWithDoc(doc, categoryId);
      });
  }

  private removeCategoryFromRecipeWithDoc(doc: DocumentData, categoryId: string): void {
    doc.ref.update({ categories: doc.data().categories.filter(c => c.id !== categoryId) });
  }

  public getCategoryRef(id: string): DocumentReference {
    return this.categories.doc(id).ref;
  }
}
