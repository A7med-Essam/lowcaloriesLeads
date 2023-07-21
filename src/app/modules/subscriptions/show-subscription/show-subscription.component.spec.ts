import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSubscriptionComponent } from './show-subscription.component';

describe('ShowSubscriptionComponent', () => {
  let component: ShowSubscriptionComponent;
  let fixture: ComponentFixture<ShowSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
