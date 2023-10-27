import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrouGanhouComponent } from './cadastrou-ganhou.component';

describe('CadastrouGanhouComponent', () => {
  let component: CadastrouGanhouComponent;
  let fixture: ComponentFixture<CadastrouGanhouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastrouGanhouComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrouGanhouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
