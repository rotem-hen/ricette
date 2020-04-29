import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCategoryModalComponent } from './new-category-modal.component';

describe('NewCategoryModalComponent', () => {
  let component: NewCategoryModalComponent;
  let fixture: ComponentFixture<NewCategoryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCategoryModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
