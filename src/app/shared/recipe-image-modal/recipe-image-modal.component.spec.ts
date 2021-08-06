import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeImageModalComponent } from './recipe-image-modal.component';

describe('RecipeImageModalComponent', () => {
  let component: RecipeImageModalComponent;
  let fixture: ComponentFixture<RecipeImageModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeImageModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeImageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
