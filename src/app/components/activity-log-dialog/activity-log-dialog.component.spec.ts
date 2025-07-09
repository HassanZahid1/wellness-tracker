import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogDialogComponent } from './activity-log-dialog.component';

describe('ActivityLogDialogComponent', () => {
  let component: ActivityLogDialogComponent;
  let fixture: ComponentFixture<ActivityLogDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
