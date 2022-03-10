import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeComponent } from './annee.component';

describe('AnneeComponent', () => {
  let component: AnneeComponent;
  let fixture: ComponentFixture<AnneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnneeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
