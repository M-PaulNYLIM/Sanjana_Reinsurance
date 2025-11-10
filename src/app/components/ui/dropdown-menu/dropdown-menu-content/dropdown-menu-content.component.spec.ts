import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownMenuContentComponent } from './dropdown-menu-content.component';

describe('DropdownMenuContentComponent', () => {
  let component: DropdownMenuContentComponent;
  let fixture: ComponentFixture<DropdownMenuContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMenuContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownMenuContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
