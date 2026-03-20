import { StateService } from './state.service';
import { Router } from '@angular/router';

describe('StateService', () => {
  let service: StateService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    service = new StateService(routerSpy);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created with empty state', () => {
    expect(service).toBeTruthy();
    expect(service.currentState.lastRecipeId).toBeNull();
    expect(service.currentState.states).toEqual([]);
  });

  it('should restore state from localStorage on construction', () => {
    const stored = JSON.stringify({
      lastRecipeId: 'r1',
      states: [
        { recipeId: 'r1', recipeUrl: '/recipes/r1', striked: '1,2,3', stage: '2', timeStamp: `${Date.now()}` }
      ]
    });
    localStorage.setItem('lastState', stored);

    service = new StateService(routerSpy);

    expect(service.currentState.lastRecipeId).toBe('r1');
    expect(service.currentState.states.length).toBe(1);
    expect(service.currentState.states[0].recipeId).toBe('r1');
    expect(service.currentState.states[0].striked).toEqual(new Set([1, 2, 3]));
    expect(service.currentState.states[0].stage).toBe(2);
  });

  it('should filter expired states on restore', () => {
    const threeHoursAgo = Date.now() - 1000 * 60 * 60 * 3;
    const stored = JSON.stringify({
      lastRecipeId: 'r1',
      states: [
        { recipeId: 'r1', recipeUrl: '/recipes/r1', striked: '', stage: '-1', timeStamp: `${threeHoursAgo}` }
      ]
    });
    localStorage.setItem('lastState', stored);

    service = new StateService(routerSpy);

    expect(service.currentState.states.length).toBe(0);
  });

  describe('setStateById', () => {
    it('should add a new recipe state', () => {
      service.setStateById('r1', '/recipes/r1', new Set([0, 1]), 2, true);

      expect(service.currentState.states.length).toBe(1);
      expect(service.currentState.states[0].recipeId).toBe('r1');
      expect(service.currentState.states[0].striked).toEqual(new Set([0, 1]));
      expect(service.currentState.states[0].stage).toBe(2);
      expect(service.currentState.lastRecipeId).toBe('r1');
    });

    it('should update existing recipe state', () => {
      service.setStateById('r1', '/recipes/r1', new Set([0]), 1, true);
      service.setStateById('r1', '/recipes/r1', new Set([0, 1, 2]), 3, true);

      expect(service.currentState.states.length).toBe(1);
      expect(service.currentState.states[0].striked).toEqual(new Set([0, 1, 2]));
      expect(service.currentState.states[0].stage).toBe(3);
    });

    it('should not set lastRecipeId when setLastRecipe is false', () => {
      service.setStateById('r1', '/recipes/r1', new Set(), 0, false);

      expect(service.currentState.lastRecipeId).toBeNull();
    });

    it('should persist to localStorage', () => {
      service.setStateById('r1', '/recipes/r1', new Set([1]), 0, true);

      const stored = JSON.parse(localStorage.getItem('lastState'));
      expect(stored.lastRecipeId).toBe('r1');
      expect(stored.states.length).toBe(1);
    });

    it('should preserve existing striked set when null is passed', () => {
      service.setStateById('r1', '/recipes/r1', new Set([5, 6]), 0, true);
      service.setStateById('r1', '/recipes/r1', null, 1, true);

      expect(service.getStrikedSetById('r1')).toEqual(new Set([5, 6]));
    });

    it('should preserve existing stage when null is passed', () => {
      service.setStateById('r1', '/recipes/r1', new Set(), 3, true);
      service.setStateById('r1', '/recipes/r1', new Set(), null, true);

      expect(service.getStageNumberById('r1')).toBe(3);
    });
  });

  describe('getStrikedSetById / getStageNumberById', () => {
    it('should return undefined for unknown recipe', () => {
      expect(service.getStrikedSetById('unknown')).toBeUndefined();
      expect(service.getStageNumberById('unknown')).toBeUndefined();
    });

    it('should return correct values for known recipe', () => {
      service.setStateById('r1', '/recipes/r1', new Set([2, 4]), 5, false);

      expect(service.getStrikedSetById('r1')).toEqual(new Set([2, 4]));
      expect(service.getStageNumberById('r1')).toBe(5);
    });
  });

  describe('redirectToLastRecipe', () => {
    it('should navigate to last recipe if not expired', () => {
      service.setStateById('r1', '/recipes/r1', new Set(), 0, true);

      service.redirectToLastRecipe();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['recipes', 'r1']);
    });

    it('should not navigate if no last recipe', () => {
      service.redirectToLastRecipe();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should clear and not navigate if last recipe is expired', () => {
      // Manually set an expired state
      service.currentState.lastRecipeId = 'r1';
      service.currentState.states.push({
        recipeId: 'r1',
        recipeUrl: '/recipes/r1',
        striked: new Set(),
        stage: -1,
        timeStamp: Date.now() - 1000 * 60 * 60 * 3
      });

      service.redirectToLastRecipe();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(service.currentState.lastRecipeId).toBeNull();
    });
  });

  describe('clearLastRecipe', () => {
    it('should clear lastRecipeId but keep state when includeState is false', () => {
      service.setStateById('r1', '/recipes/r1', new Set([1]), 0, true);
      service.clearLastRecipe(false);

      expect(service.currentState.lastRecipeId).toBeNull();
      expect(service.currentState.states.length).toBe(1);
    });

    it('should clear lastRecipeId and state when includeState is true', () => {
      service.setStateById('r1', '/recipes/r1', new Set([1]), 0, true);
      service.clearLastRecipe(true);

      expect(service.currentState.lastRecipeId).toBeNull();
      expect(service.currentState.states.length).toBe(0);
    });
  });

  describe('multiple recipes', () => {
    it('should track state for multiple recipes independently', () => {
      service.setStateById('r1', '/recipes/r1', new Set([0]), 1, true);
      service.setStateById('r2', '/recipes/r2', new Set([3, 4]), 2, true);

      expect(service.currentState.states.length).toBe(2);
      expect(service.getStrikedSetById('r1')).toEqual(new Set([0]));
      expect(service.getStrikedSetById('r2')).toEqual(new Set([3, 4]));
      expect(service.getStageNumberById('r1')).toBe(1);
      expect(service.getStageNumberById('r2')).toBe(2);
      expect(service.currentState.lastRecipeId).toBe('r2');
    });
  });
});
