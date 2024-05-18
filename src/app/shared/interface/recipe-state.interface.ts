export interface RecipeState {
  recipeId: string;
  recipeUrl: string;
  striked: Set<number>;
  stage: number;
  timeStamp: number;
}
