import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GetUrlModalComponent } from './get-url-modal.component';

describe('getUrlModalComponent', () => {
  let component: GetUrlModalComponent;
  let fixture: ComponentFixture<GetUrlModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GetUrlModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetUrlModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
