import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesState } from 'app/shared/interface/recipes-state.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  LOCAL_STORAGE_LABEL = 'lastState';
  EXPIRY_TIME = 1000 * 60 * 60 * 2; // 2 hours
  currentState: RecipesState = {
    lastRecipeId: null,
    states: []
  };

  constructor(private router: Router) {
    const lastState = localStorage.getItem(this.LOCAL_STORAGE_LABEL);
    if (lastState) {
      this.setCurrentStateFromStorage(JSON.parse(lastState));
    }
  }

  private setCurrentStateFromStorage(parsedState): void {
    this.currentState.lastRecipeId = parsedState.lastRecipeId;
    const now = Date.now();
    parsedState.states = parsedState.states?.filter(s => now - s.timeStamp < this.EXPIRY_TIME) ?? [];
    parsedState.states.forEach(s =>
      this.setCurrentStateById(
        s.recipeId,
        s.recipeUrl,
        this.strikedToSet(s.striked),
        parseInt(s.stage),
        parseInt(s.timeStamp),
        false
      )
    );
  }

  public setStateById(
    recipeId: string,
    recipeUrl: string,
    striked: Set<number>,
    stage: number,
    setLastRecipe: boolean
  ): void {
    striked = !striked && this.getStrikedSetById(recipeId) ? this.getStrikedSetById(recipeId) : striked;
    stage = stage === null && this.getStageNumberById(recipeId) > -1 ? this.getStageNumberById(recipeId) : stage;
    const now = Date.now();
    this.setCurrentStateById(recipeId, recipeUrl, striked, stage, now, setLastRecipe);
    this.updateLocalStorage();
  }

  private setCurrentStateById(
    recipeId: string,
    recipeUrl: string,
    striked: Set<number>,
    stage: number,
    timeStamp: number,
    setLastRecipe: boolean
  ): void {
    let recipeInd = this.getIndexById(recipeId);
    recipeInd = recipeInd > -1 ? recipeInd : this.currentState.states.length;
    this.currentState.states[recipeInd] = {
      recipeId,
      recipeUrl,
      striked,
      stage,
      timeStamp
    };
    if (setLastRecipe) this.currentState.lastRecipeId = recipeId;
  }

  private updateLocalStorage(): void {
    const states = this.currentState.states.map(
      s =>
        `{
          "recipeId": "${s.recipeId}",
          "recipeUrl": "${s.recipeUrl}",
          "striked": "${this.strikedToString(s.striked)}",
          "stage": "${this.stageToString(s.stage)}",
          "timeStamp": "${s.timeStamp}"
        }`
    );

    const state = `{
      "lastRecipeId": "${this.currentState.lastRecipeId}",
      "states": [
        ${states.join(',')}
      ]
    }`;
    return localStorage.setItem(this.LOCAL_STORAGE_LABEL, state);
  }

  public redirectToLastRecipe(): void {
    const lastRecipe = this.currentState.states[this.getLastRecipeInd()];
    if (!lastRecipe) return;
    const url = lastRecipe.recipeUrl;
    const time = lastRecipe.timeStamp;
    if (Date.now() - time > this.EXPIRY_TIME) {
      this.clearLastRecipe(true);
    } else if (url) {
      this.router.navigate(['recipes', url.split('/')[2]]);
    }
  }

  private clearStateById(recipeId: string): void {
    const recipeInd = this.getIndexById(recipeId);
    if (recipeInd > -1) {
      this.currentState.states.splice(recipeInd, 1);
    }
  }

  public clearLastRecipe(includeState: boolean): void {
    if (includeState) this.clearStateById(this.currentState.lastRecipeId);
    this.currentState.lastRecipeId = null;
    this.updateLocalStorage();
  }

  public getStrikedSetById(recipeId: string): Set<number> {
    return this.currentState.states[this.getIndexById(recipeId)]?.striked;
  }

  public getStageNumberById(recipeId: string): number {
    return this.currentState.states[this.getIndexById(recipeId)]?.stage;
  }

  private strikedToString(striked: Set<number>): string {
    return striked ? Array.from(striked).join(',') : '';
  }

  private strikedToSet(striked: string): Set<number> {
    return striked ? new Set(striked.split(',').map(i => parseInt(i))) : new Set<number>();
  }

  private stageToString(stage: number): string {
    return stage !== null ? stage.toString() : '-1';
  }

  private getIndexById(recipeId: string): number {
    return this.currentState.states.findIndex(s => s.recipeId === recipeId);
  }

  private getLastRecipeInd(): number {
    return this.getIndexById(this.currentState.lastRecipeId);
  }
}
