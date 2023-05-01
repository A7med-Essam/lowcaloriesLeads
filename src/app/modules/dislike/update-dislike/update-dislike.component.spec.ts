import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDislikeComponent } from './update-dislike.component';

describe('UpdateDislikeComponent', () => {
  let component: UpdateDislikeComponent;
  let fixture: ComponentFixture<UpdateDislikeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDislikeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDislikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
