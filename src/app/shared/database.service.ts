import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, DocumentData } from 'angularfire2/firestore';
import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public categories$: AngularFirestoreCollection<Category>;
  public recipes$: AngularFirestoreCollection<Recipe>;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.categories$ = firestore.collection<Category>('categories', ref =>
      ref.where('uid', '==', authService.loggedInUserId).orderBy('name')
    );
    this.recipes$ = firestore.collection<Recipe>('recipes', ref =>
      ref.where('uid', '==', authService.loggedInUserId).orderBy('title')
    );
  }

  public getCategories(): Observable<Category[]> {
    return this.categories$.valueChanges({ idField: 'id' });
  }

  public getRecipes(): Observable<Recipe[]> {
    return this.recipes$.valueChanges({ idField: 'id' });
  }

  public async editCategory({ id, name, color }: Category): Promise<void> {
    return this.categories$.doc(id).update({ name, color });
  }

  public async editRecipe(id: string, recipe: Recipe): Promise<void> {
    return this.recipes$.doc(id).update({ ...recipe });
  }

  public async editRecipeImage(id: string, image: string): Promise<void> {
    return this.recipes$.doc(id).update({ image });
  }

  public async addCategory(category: Category): Promise<string> {
    const { id } = await this.categories$.add({ ...category, uid: this.authService.loggedInUserId });
    return id;
  }

  public async addRecipe(recipe: Recipe): Promise<string> {
    const { id } = await this.recipes$.add({ ...recipe, uid: this.authService.loggedInUserId });
    return id;
  }

  public async deleteCategory(id: string): Promise<void> {
    const categoryRef = this.categories$.doc(id);

    const query = this.recipes$.ref.where('categories', 'array-contains', categoryRef.ref);
    query.get().then(recipes => {
      recipes.forEach(doc => {
        this.removeCategoryFromRecipeWithDoc(doc, id);
      });
    });

    return categoryRef.delete();
  }

  public async deleteRecipe(id: string, imageUrl: string): Promise<void> {
    this.storageService.removeImage(imageUrl);
    return this.recipes$.doc(id).delete();
  }

  public addCategoryToRecipe(recipeId: string, categoryId: string): void {
    const categoryRef = this.getCategoryRef(categoryId);
    this.recipes$
      .doc(recipeId)
      .get()
      .pipe(take(1))
      .subscribe(doc => {
        const categories = doc.data().categories;
        categories.push(categoryRef);
        doc.ref.update({ categories });
      });
  }

  public removeCategoryFromRecipe(recipeId: string, categoryId: string): void {
    this.recipes$
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
    return this.categories$.doc(id).ref;
  }
}
