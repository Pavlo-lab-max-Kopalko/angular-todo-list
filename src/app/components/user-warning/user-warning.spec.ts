import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWarning } from './user-warning';

describe('UserWarning', () => {
  let component: UserWarning;
  let fixture: ComponentFixture<UserWarning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWarning],
    }).compileComponents();

    fixture = TestBed.createComponent(UserWarning);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
