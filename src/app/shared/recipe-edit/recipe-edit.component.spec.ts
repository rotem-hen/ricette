import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecipeEditComponent } from './recipe-edit.component';
import { EditModeService } from '../edit-mode.service';
import { DatabaseService } from '../database.service';
import { ToastService } from '../toast.service';
import { PopupService } from '../popup.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RecipeEditState } from '../interface/recipe-edit-state.interface';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';

describe('RecipeEditComponent', () => {
  let component: RecipeEditComponent;
  let fixture: ComponentFixture<RecipeEditComponent>;
  let editModeService: EditModeService;
  let routerSpy: jasmine.SpyObj<Router>;
  let dbServiceMock: any;
  let locationSpy: jasmine.SpyObj<Location>;
  let analyticsMock: any;
  let toastService: ToastService;

  const mockState: RecipeEditState = {
    id: 'r1',
    title: 'Test Recipe',
    isFavourite: false,
    ingredients: 'flour\nsugar',
    prep: 'Mix\nBake',
    link: '',
    duration: 90,
    quantity: '4',
    image: '',
    newRecipe: false,
    options: [
      { category: { id: 'cat1', name: 'Italian', color: '#f00' }, selected: true }
    ],
    relatedRecipes: []
  };

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    editModeService = new EditModeService();
    toastService = new ToastService();
    dbServiceMock = {
      getCategories: () => of([]),
      addRecipe: jasmine.createSpy('addRecipe').and.returnValue(Promise.resolve()),
      editRecipe: jasmine.createSpy('editRecipe').and.returnValue(Promise.resolve()),
      deleteRecipe: jasmine.createSpy('deleteRecipe').and.returnValue(Promise.resolve()),
      getCategoryRef: jasmine.createSpy('getCategoryRef').and.returnValue({ id: 'cat1' })
    };
    analyticsMock = {
      logEvent: jasmine.createSpy('logEvent')
    };

    TestBed.configureTestingModule({
      declarations: [RecipeEditComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: EditModeService, useValue: editModeService },
        { provide: DatabaseService, useValue: dbServiceMock },
        { provide: ToastService, useValue: toastService },
        { provide: PopupService, useValue: jasmine.createSpyObj('PopupService', ['confirm']) },
        { provide: Location, useValue: locationSpy },
        { provide: AngularFireAnalytics, useValue: analyticsMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(RecipeEditComponent, { set: { template: '' } })
      .compileComponents();
  }));

  beforeEach(() => {
    window.history.pushState({ isNew: false }, '');
    fixture = TestBed.createComponent(RecipeEditComponent);
    component = fixture.componentInstance;
    component.state = { ...mockState, options: [...mockState.options], relatedRecipes: [] };
    component.isNew = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize hours and minutes from duration', () => {
    expect(component.hours).toBe(1);
    expect(component.minutes).toBe(30);
  });

  it('should initialize hours=0 and minutes=0 when duration is 0', () => {
    component.state.duration = 0;
    component.ngOnInit();
    expect(component.hours).toBe(0);
    expect(component.minutes).toBe(0);
  });

  describe('onOK', () => {
    it('should show error when title is empty', async () => {
      component.state.title = '';
      const errorToast = {};

      await component.onOK(errorToast);

      expect(component.errorMessage).toBe('אנא בחרו שם למתכון');
      expect(dbServiceMock.editRecipe).not.toHaveBeenCalled();
      expect(dbServiceMock.addRecipe).not.toHaveBeenCalled();
    });

    it('should call editRecipe for existing recipes', async () => {
      component.state.newRecipe = false;
      component.state.title = 'Updated Recipe';

      await component.onOK({});

      expect(dbServiceMock.editRecipe).toHaveBeenCalled();
      expect(dbServiceMock.addRecipe).not.toHaveBeenCalled();
    });

    it('should call addRecipe for new recipes', async () => {
      component.state.newRecipe = true;
      component.state.title = 'New Recipe';

      await component.onOK({});

      expect(dbServiceMock.addRecipe).toHaveBeenCalled();
    });

    it('should navigate to recipe page after save', async () => {
      component.state.title = 'Test';

      await component.onOK({});

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/recipes', 'r1']);
    });

    it('should set loading to false after save', async () => {
      component.state.title = 'Test';

      await component.onOK({});

      expect(component.loading).toBeFalse();
    });
  });

  describe('onCancel', () => {
    it('should restore original state', () => {
      component.state.title = 'Modified';
      component.onCancel();
      expect(component.state.title).toBe('Test Recipe');
    });

    it('should close edit mode', () => {
      editModeService.toggleEditMode(true);
      component.onCancel();
      expect(editModeService.isEditMode).toBeFalse();
    });

    it('should navigate back for new recipes', () => {
      // Must reinitialize with newRecipe=true as originalState,
      // since onCancel restores the original state before checking newRecipe
      component.state.newRecipe = true;
      component.ngOnInit(); // re-clone the state so originalState.newRecipe = true
      component.onCancel();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it('should not navigate back for existing recipes', () => {
      component.state.newRecipe = false;
      component.onCancel();
      expect(locationSpy.back).not.toHaveBeenCalled();
    });
  });

  describe('getDuration (via onOK)', () => {
    it('should calculate duration from hours and minutes', async () => {
      component.hours = 2;
      component.minutes = 15;
      component.state.title = 'Test';

      await component.onOK({});

      expect(component.state.duration).toBe(135);
    });

    it('should handle hours only', async () => {
      component.hours = 1;
      component.minutes = 0;
      component.state.title = 'Test';

      await component.onOK({});

      expect(component.state.duration).toBe(60);
    });

    it('should handle minutes only', async () => {
      component.hours = 0;
      component.minutes = 45;
      component.state.title = 'Test';

      await component.onOK({});

      expect(component.state.duration).toBe(45);
    });
  });
});
