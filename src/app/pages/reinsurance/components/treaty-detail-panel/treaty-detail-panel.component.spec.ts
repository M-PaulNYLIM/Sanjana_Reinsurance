import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatyDetailPanelComponent } from './treaty-detail-panel.component';

describe('TreatyDetailPanelComponent', () => {
  let component: TreatyDetailPanelComponent;
  let fixture: ComponentFixture<TreatyDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatyDetailPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatyDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
