import { EnvironmentInjector, Injectable, NgZone, runInInjectionContext } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, DocumentData } from '@angular/fire/compat/firestore';
import { Category } from 'app/content/interface/category.interface';
import { Recipe } from 'app/content/interface/recipe.interface';
import { Observable } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { enterZone } from './enter-zone';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  public categories$: AngularFirestoreCollection<Category>;
  public recipes$: AngularFirestoreCollection<Recipe>;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private storageService: StorageService,
    private injector: EnvironmentInjector,
    private ngZone: NgZone
  ) {
    this.categories$ = firestore.collection<Category>('categories', ref =>
      ref.where('uid', '==', authService.loggedInUserId).orderBy('name')
    );
    this.recipes$ = firestore.collection<Recipe>('recipes', ref =>
      ref.where('uid', '==', authService.loggedInUserId).orderBy('title')
    );
  }

  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

  public getCategories(): Observable<Category[]> {
    return this.run(() =>
      this.firestore
        .collection<Category>('categories', ref =>
          ref.where('uid', '==', this.authService.loggedInUserId).orderBy('name')
        )
        .valueChanges({ idField: 'id' })
    ).pipe(enterZone(this.ngZone), takeUntil(this.authService.logout$));
  }

  public getRecipes(): Observable<Recipe[]> {
    return this.run(() =>
      this.firestore
        .collection<Recipe>('recipes', ref => ref.where('uid', '==', this.authService.loggedInUserId).orderBy('title'))
        .valueChanges({ idField: 'id' })
    ).pipe(enterZone(this.ngZone), takeUntil(this.authService.logout$));
  }

  public async editCategory({ id, name, color }: Category): Promise<string> {
    await this.run(() => this.categories$.doc(id).update({ name, color }));
    return id;
  }

  public async editRecipe(id: string, recipe: Recipe): Promise<void> {
    return this.run(() => this.recipes$.doc(id).update({ ...recipe }));
  }

  public async editRecipeImage(id: string, image: string): Promise<void> {
    return this.run(() => this.recipes$.doc(id).update({ image }));
  }

  public async addCategory(id: string, category: Category): Promise<void> {
    return this.run(() =>
      this.categories$
        .doc(id)
        .set({ ...category, uid: this.authService.loggedInUserId })
    ).catch(e => console.error(e));
  }

  public async addRecipe(id: string, recipe: Recipe): Promise<void> {
    await this.run(() =>
      this.recipes$.doc(id).set({ ...recipe, uid: this.authService.loggedInUserId })
    );
  }

  public async deleteCategory(id: string): Promise<void> {
    const categoryRef = this.run(() => this.categories$.doc(id));

    const query = this.recipes$.ref
      .where('uid', '==', this.authService.loggedInUserId)
      .where('categories', 'array-contains', categoryRef.ref);
    try {
      const relatedRecipies = await query.get();

      for (const doc of relatedRecipies.docs) {
        await this.removeCategoryFromRecipeWithDoc(doc, id);
      }
    } catch (e) {
      console.error('Error removing category from recipes', e);
      throw e;
    }

    return categoryRef.delete();
  }

  public async deleteRecipe(id: string, imageUrl: string): Promise<void> {
    this.storageService.removeImage(imageUrl);
    return this.run(() => this.recipes$.doc(id).delete());
  }

  public addCategoryToRecipe(recipeId: string, categoryId: string): void {
    const categoryRef = this.getCategoryRef(categoryId);
    this.run(() => this.recipes$
      .doc(recipeId)
      .get()
    ).pipe(take(1))
      .subscribe(doc => {
        const categories = doc.data().categories;
        categories.push(categoryRef);
        doc.ref.update({ categories });
      });
  }

  public removeCategoryFromRecipe(recipeId: string, categoryId: string): void {
    this.run(() => this.recipes$
      .doc(recipeId)
      .get()
    ).pipe(take(1))
      .subscribe(doc => {
        this.removeCategoryFromRecipeWithDoc(doc, categoryId);
      });
  }

  private removeCategoryFromRecipeWithDoc(
    doc: firebase.firestore.DocumentSnapshot<DocumentData>,
    categoryId: string
  ): Promise<void> {
    return doc.ref.update({ categories: doc.data().categories.filter(c => c.id !== categoryId) }).catch(e => {
      console.error(`Error removing category from recipe ${doc.id}`, e);
      throw e;
    });
  }

  public getCategoryRef(id: string): DocumentReference {
    return this.run(() => this.categories$.doc(id).ref);
  }
}
