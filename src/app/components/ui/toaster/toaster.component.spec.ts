import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToasterComponent } from './toaster.component';
import { ToastService } from '../../../../services/toast.service';

class MockToastService {
  toasts$ = of([]);
  dismiss(): void {}
}

describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToasterComponent],
      providers: [{ provide: ToastService, useClass: MockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
