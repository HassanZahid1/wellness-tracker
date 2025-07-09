import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellnessLogComponent } from './wellness-log.component';

describe('WellnessLogComponent', () => {
  let component: WellnessLogComponent;
  let fixture: ComponentFixture<WellnessLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellnessLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WellnessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
