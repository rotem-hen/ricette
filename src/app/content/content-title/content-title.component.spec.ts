import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentTitleComponent } from './content-title.component';

describe('ContentTitleComponent', () => {
  let component: ContentTitleComponent;
  let fixture: ComponentFixture<ContentTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ContentTitleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
