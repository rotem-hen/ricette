import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { Router } from '@angular/router';
import { EditModeService } from 'app/shared/edit-mode.service';
import { DatabaseService } from 'app/shared/database.service';
import { ToastService } from 'app/shared/toast.service';
import { PopupService } from 'app/shared/popup.service';
import { AuthService } from 'app/shared/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let editModeService: EditModeService;
  let dbServiceMock: any;
  let analyticsMock: any;

  const mockCategories = [
    { id: 'cat1', name: 'Italian', color: '#ff0000' },
    { id: 'cat2', name: 'Desserts', color: '#00ff00' }
  ];

  const mockRecipes = [
    { id: 'r1', title: 'Pasta', categories: [{ id: 'cat1' }], isFavourite: false },
    { id: 'r2', title: 'Cake', categories: [{ id: 'cat2' }], isFavourite: true }
  ];

  beforeEach(waitForAsync(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    editModeService = new EditModeService();
    dbServiceMock = {
      getCategories: () => of(mockCategories),
      getRecipes: () => of(mockRecipes),
      addCategory: jasmine.createSpy('addCategory').and.returnValue(Promise.resolve()),
      deleteCategory: jasmine.createSpy('deleteCategory').and.returnValue(Promise.resolve())
    };
    analyticsMock = {
      logEvent: jasmine.createSpy('logEvent')
    };

    TestBed.configureTestingModule({
      declarations: [CategoriesComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: EditModeService, useValue: editModeService },
        { provide: DatabaseService, useValue: dbServiceMock },
        { provide: ToastService, useValue: new ToastService() },
        { provide: PopupService, useValue: jasmine.createSpyObj('PopupService', ['confirm']) },
        { provide: AuthService, useValue: { newUser$: new BehaviorSubject(null) } },
        { provide: AngularFireAnalytics, useValue: analyticsMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(CategoriesComponent, {
        set: {
          providers: [],
          template: ''
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories including special views on init', () => {
    expect(component.categoryList).toBeDefined();
    expect(component.categoryList.length).toBeGreaterThan(2);
  });

  it('should load recipes on init', () => {
    expect(component.recipeList).toBeDefined();
    expect(component.recipeList.length).toBe(2);
  });

  describe('onCategoryClick', () => {
    it('should navigate when not in edit mode', (done) => {
      editModeService.toggleEditMode(false);
      component.onCategoryClick({ id: 'cat1', name: 'Italian', color: '#f00' });

      setTimeout(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/categories', 'cat1']);
        done();
      }, 300);
    });

    it('should not navigate when in edit mode', (done) => {
      editModeService.toggleEditMode(true);
      component.onCategoryClick({ id: 'cat1', name: 'Italian', color: '#f00' });

      setTimeout(() => {
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      }, 300);
    });
  });

  describe('gotIt / messageShown', () => {
    it('should hide message and persist to localStorage', () => {
      component.gotIt('iosMessage');
      expect(component.showMessages['iosMessage']).toBeFalse();
      expect(localStorage.getItem('iosMessage')).toBe('true');
    });

    it('should return true for previously dismissed messages', () => {
      localStorage.setItem('iosMessage', 'true');
      expect(component.messageShown('iosMessage')).toBeTrue();
    });

    it('should return false for unseen messages', () => {
      expect(component.messageShown('newMessage')).toBeFalse();
    });
  });
});
