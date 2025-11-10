import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PolicyDetailsComponent } from './policy-details.component';

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDetailsComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
