import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReinsuranceComponent } from './reinsurance.component';

describe('ReinsuranceComponent', () => {
  let component: ReinsuranceComponent;
  let fixture: ComponentFixture<ReinsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReinsuranceComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
