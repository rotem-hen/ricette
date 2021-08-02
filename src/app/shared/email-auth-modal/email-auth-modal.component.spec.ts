import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAuthModalComponent } from './email-auth-modal.component';

describe('EmailAuthModalComponent', () => {
  let component: EmailAuthModalComponent;
  let fixture: ComponentFixture<EmailAuthModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailAuthModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailAuthModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
