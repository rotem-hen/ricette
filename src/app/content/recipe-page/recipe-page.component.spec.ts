import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecipePageComponent } from './recipe-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EditModeService } from 'app/shared/edit-mode.service';
import { DatabaseService } from 'app/shared/database.service';
import { ToastService } from 'app/shared/toast.service';
import { StateService } from 'app/shared/state.service';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RecipePageComponent', () => {
  let component: RecipePageComponent;
  let fixture: ComponentFixture<RecipePageComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dbServiceMock: any;
  let stateServiceMock: any;
  let editModeServiceMock: any;

  const mockRecipe = {
    id: 'r1',
    title: 'Test Recipe',
    categories: [{ id: 'cat1' }],
    isFavourite: false,
    ingredients: 'flour\nsugar\nbutter',
    prep: 'Mix\nBake',
    duration: 90,
    quantity: '4',
    link: 'https://example.com',
    relatedRecipes: [],
    image: ''
  };

  const mockCategories = [{ id: 'cat1', name: 'Desserts', color: '#f00' }];

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dbServiceMock = {
      getRecipes: () => of([mockRecipe]),
      getCategories: () => of(mockCategories)
    };
    stateServiceMock = {
      getStrikedSetById: jasmine.createSpy('getStrikedSetById').and.returnValue(null),
      getStageNumberById: jasmine.createSpy('getStageNumberById').and.returnValue(-1),
      setStateById: jasmine.createSpy('setStateById')
    };
    editModeServiceMock = {
      isEditMode: false,
      toggleEditMode: jasmine.createSpy('toggleEditMode'),
      editModeChange: new Subject<boolean>()
    };

    TestBed.configureTestingModule({
      declarations: [RecipePageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'r1' }) } },
        { provide: Router, useValue: routerSpy },
        { provide: EditModeService, useValue: editModeServiceMock },
        { provide: DatabaseService, useValue: dbServiceMock },
        { provide: ToastService, useValue: new ToastService() },
        { provide: StateService, useValue: stateServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    // history.state is accessed in the constructor, ensure it's not null
    window.history.pushState({ isNew: false }, '');
    fixture = TestBed.createComponent(RecipePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipe on init', () => {
    expect(component.recipe).toBeDefined();
    expect(component.recipe.title).toBe('Test Recipe');
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(component.formatDuration(30)).toBe('30 דקות');
    });

    it('should format 1 hour', () => {
      expect(component.formatDuration(60)).toBe('שעה');
    });

    it('should format 2 hours', () => {
      expect(component.formatDuration(120)).toBe('שעתיים');
    });

    it('should format 3+ hours', () => {
      expect(component.formatDuration(180)).toBe('3 שעות');
    });

    it('should format hours and minutes', () => {
      expect(component.formatDuration(90)).toBe('שעה ו-30 דקות');
    });

    it('should format 2 hours and minutes', () => {
      expect(component.formatDuration(125)).toBe('שעתיים ו-5 דקות');
    });

    it('should format 0 minutes as empty', () => {
      expect(component.formatDuration(0)).toBe('');
    });
  });

  describe('isSubtitle', () => {
    it('should return true for strings ending with colon', () => {
      expect(component.isSubtitle('For the sauce:')).toBeTrue();
    });

    it('should return false for regular strings', () => {
      expect(component.isSubtitle('2 cups flour')).toBeFalse();
    });
  });

  describe('ingredient strikethrough', () => {
    it('should toggle ingredient strikethrough on', () => {
      component.onIngredientClick(0);
      expect(component.isStriked(0)).toBeTrue();
    });

    it('should toggle ingredient strikethrough off', () => {
      component.onIngredientClick(0);
      component.onIngredientClick(0);
      expect(component.isStriked(0)).toBeFalse();
    });

    it('should track multiple striked ingredients', () => {
      component.onIngredientClick(0);
      component.onIngredientClick(2);
      expect(component.isStriked(0)).toBeTrue();
      expect(component.isStriked(1)).toBeFalse();
      expect(component.isStriked(2)).toBeTrue();
    });
  });

  describe('stage click', () => {
    it('should set active stage on click', () => {
      component.onStageClick(1);
      expect(component.activeStage).toBe(1);
    });

    it('should deactivate stage on second click', () => {
      component.onStageClick(1);
      component.onStageClick(1);
      expect(component.activeStage).toBe(-1);
    });

    it('should switch to different stage', () => {
      component.onStageClick(1);
      component.onStageClick(2);
      expect(component.activeStage).toBe(2);
    });
  });

  describe('navigation', () => {
    it('should navigate to category on label click', () => {
      component.onCategoryLabelClick('cat1');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['categories', 'cat1']);
    });

    it('should navigate to recipe on label click', () => {
      component.onRecipeLabelClick('r2');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['recipes', 'r2']);
    });
  });

  describe('shouldShowCopyButton', () => {
    it('should return true when clipboard API is available', () => {
      expect(component.shouldShowCopyButton()).toBe('clipboard' in navigator);
    });
  });
});
