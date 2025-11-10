import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatyGridComponent } from './treaty-grid.component';

describe('TreatyGridComponent', () => {
  let component: TreatyGridComponent;
  let fixture: ComponentFixture<TreatyGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatyGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatyGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
