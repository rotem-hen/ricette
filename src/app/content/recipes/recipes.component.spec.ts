import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecipesComponent } from './recipes.component';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'app/shared/search.service';
import { DatabaseService } from 'app/shared/database.service';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SpecialCategories } from '../category-views/category-views';

describe('RecipesComponent', () => {
  let component: RecipesComponent;
  let fixture: ComponentFixture<RecipesComponent>;
  let searchService: SearchService;
  let routeParamsSubject: Subject<any>;

  const mockCategories = [
    { id: 'cat1', name: 'Italian', color: '#ff0000' },
    { id: 'cat2', name: 'Desserts', color: '#00ff00' }
  ];

  const mockRecipes = [
    { id: 'r1', title: 'Pasta Carbonara', categories: [{ id: 'cat1' }], isFavourite: false, ingredients: 'pasta\neggs\nbacon' },
    { id: 'r2', title: 'Chocolate Cake', categories: [{ id: 'cat2' }], isFavourite: true, ingredients: 'flour\nsugar\ncocoa' },
    { id: 'r3', title: 'Pizza', categories: [{ id: 'cat1' }], isFavourite: false, ingredients: 'dough\ntomato\ncheese' }
  ];

  function setupComponent(categoryId: string, recipes = mockRecipes): void {
    routeParamsSubject = new Subject();
    searchService = new SearchService();

    TestBed.configureTestingModule({
      declarations: [RecipesComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: routeParamsSubject } },
        { provide: SearchService, useValue: searchService },
        {
          provide: DatabaseService,
          useValue: {
            getCategories: () => of(mockCategories),
            getRecipes: () => of(recipes)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(RecipesComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(RecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    routeParamsSubject.next({ cid: categoryId });
  }

  afterEach(() => {
    if (fixture) fixture.destroy();
    TestBed.resetTestingModule();
  });

  describe('standard category', () => {
    beforeEach(() => setupComponent('cat1'));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set category name', () => {
      expect(component.categoryName).toBe('Italian');
    });

    it('should filter recipes by category', () => {
      expect(component.recipeList.length).toBe(2);
      expect(component.recipeList.map(r => r.id)).toEqual(['r1', 'r3']);
    });

    it('should identify as standard category', () => {
      expect(component.isStandardCategory()).toBeTrue();
    });
  });

  describe('special categories', () => {
    it('should identify special categories as non-standard', () => {
      setupComponent(SpecialCategories.ALL);
      expect(component.isStandardCategory()).toBeFalse();
    });
  });

  describe('favorites category', () => {
    beforeEach(() => setupComponent(SpecialCategories.FAVORITES));

    it('should filter to favourite recipes only', () => {
      expect(component.recipeList.length).toBe(1);
      expect(component.recipeList[0].id).toBe('r2');
    });
  });

  describe('all recipes category', () => {
    beforeEach(() => setupComponent(SpecialCategories.ALL));

    it('should show all recipes', () => {
      expect(component.recipeList.length).toBe(3);
    });
  });

  describe('uncategorized category', () => {
    beforeEach(() => {
      const recipesWithOrphan = [
        ...mockRecipes,
        { id: 'r4', title: 'Orphan', categories: [], isFavourite: false, ingredients: '' }
      ];
      setupComponent(SpecialCategories.UNCATEGORIZED, recipesWithOrphan);
    });

    it('should show only uncategorized recipes', () => {
      expect(component.recipeList.length).toBe(1);
      expect(component.recipeList[0].id).toBe('r4');
    });
  });

  describe('search category', () => {
    beforeEach(() => setupComponent(SpecialCategories.SEARCH_RESULTS));

    it('should filter recipes by search term', () => {
      searchService.setSearchTerm('pasta');
      expect(component.recipeList.length).toBe(1);
      expect(component.recipeList[0].title).toBe('Pasta Carbonara');
    });

    it('should search case-insensitively', () => {
      searchService.setSearchTerm('CHOCOLATE');
      expect(component.recipeList.length).toBe(1);
      expect(component.recipeList[0].title).toBe('Chocolate Cake');
    });

    it('should search in ingredients too', () => {
      searchService.setSearchTerm('bacon');
      expect(component.recipeList.length).toBe(1);
      expect(component.recipeList[0].title).toBe('Pasta Carbonara');
    });

    it('should return no results for non-matching term', () => {
      searchService.setSearchTerm('sushi');
      expect(component.recipeList.length).toBe(0);
    });

    it('should show all recipes for empty search', () => {
      searchService.setSearchTerm('');
      expect(component.recipeList.length).toBe(3);
    });
  });
});
