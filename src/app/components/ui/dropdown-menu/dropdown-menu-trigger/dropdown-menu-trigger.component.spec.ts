import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuTriggerComponent } from './dropdown-menu-trigger.component';

describe('DropdownMenuTriggerComponent', () => {
  let component: DropdownMenuTriggerComponent;
  let fixture: ComponentFixture<DropdownMenuTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuTriggerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
