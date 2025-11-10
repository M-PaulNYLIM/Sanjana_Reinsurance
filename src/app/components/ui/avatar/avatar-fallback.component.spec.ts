import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarFallbackComponent } from './avatar.component';

describe('AvatarFallbackComponent', () => {
  let component: AvatarFallbackComponent;
  let fixture: ComponentFixture<AvatarFallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarFallbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarFallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
