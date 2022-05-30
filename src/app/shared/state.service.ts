import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { State } from 'app/shared/interface/state.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  LOCAL_STORAGE_LABEL = 'lastState';
  EXPIRY_TIME = 9000000; // 2.5 hours
  currentState: State = {
    recipeUrl: '',
    striked: null,
    stage: null,
    timeStamp: 0
  };

  constructor(private router: Router) {
    const lastState = localStorage.getItem(this.LOCAL_STORAGE_LABEL);
    if (lastState) {
      const parsedState = JSON.parse(lastState);
      this.setCurrentState(
        parsedState.recipeUrl,
        this.strikedToSet(parsedState.striked),
        parseInt(parsedState.stage),
        parseInt(parsedState.timeStamp)
      );
    }
  }

  public setState(recipeUrl: string, striked: Set<number>, stage: number): void {
    striked = !striked && this.getStrikedSet() ? this.getStrikedSet() : striked;
    stage = stage === null && this.getStageNumber() > -1 ? this.getStageNumber() : stage;
    this.setLocalState(recipeUrl, striked, stage);
  }

  public redirectToLastRecipe(): void {
    const url = this.currentState.recipeUrl;
    const time = this.currentState.timeStamp;
    if (Date.now() - time > this.EXPIRY_TIME) {
      this.clearState();
    } else if (url) {
      this.router.navigate(['recipes', url.split('/')[2]]);
    }
  }

  public clearState(): void {
    this.setLocalState('', null, -1);
  }

  private setCurrentState(recipeUrl: string, striked: Set<number>, stage: number, timeStamp: number): void {
    this.currentState.recipeUrl = recipeUrl;
    this.currentState.striked = striked;
    this.currentState.stage = stage;
    this.currentState.timeStamp = timeStamp;
  }

  private setLocalState(recipeUrl: string, striked: Set<number>, stage: number): void {
    const now = Date.now();
    this.setCurrentState(recipeUrl, striked, stage, now);

    const state = `{
      "recipeUrl": "${recipeUrl}",
      "striked": "${this.strikedToString(striked)}",
      "stage": "${this.stageToString(stage)}",
      "timeStamp": "${now}"
    }`;
    return localStorage.setItem(this.LOCAL_STORAGE_LABEL, state);
  }

  public getStrikedSet(): Set<number> {
    return this.currentState.striked;
  }

  private strikedToString(striked: Set<number>): string {
    return striked ? Array.from(striked).join(',') : '';
  }

  private strikedToSet(striked: string): Set<number> {
    return striked ? new Set(striked.split(',').map(i => parseInt(i))) : new Set<number>();
  }

  public getStageNumber(): number {
    return this.currentState.stage;
  }

  private stageToString(stage: number): string {
    return stage !== null ? stage.toString() : '-1';
  }
}
