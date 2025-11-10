import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReinsuranceRatesComponent } from './reinsurance-rates.component';

describe('ReinsuranceRatesComponent', () => {
  let component: ReinsuranceRatesComponent;
  let fixture: ComponentFixture<ReinsuranceRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReinsuranceRatesComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReinsuranceRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
