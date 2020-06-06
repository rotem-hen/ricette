import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecipeImageService {
  private defaultImage = of('./assets/food.jpg');

  constructor(private afStorage: AngularFireStorage) {}

  public getRecipeImage(recipeLink: string): Observable<string> {
    return recipeLink
      ? this.afStorage
          .ref(recipeLink)
          .getDownloadURL()
          .pipe(catchError(() => this.defaultImage))
      : this.defaultImage;
  }
}
