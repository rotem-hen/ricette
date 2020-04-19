import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeEntryComponent } from './recipe-entry.component';

describe('RecipeEntryComponent', () => {
  let component: RecipeEntryComponent;
  let fixture: ComponentFixture<RecipeEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipeEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
