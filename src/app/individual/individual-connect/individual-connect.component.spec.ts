/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { IndividualConnectComponent } from './individual-connect.component';

describe('IndividualConnectComponent', () => {
  let component: IndividualConnectComponent;
  let fixture: ComponentFixture<IndividualConnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualConnectComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
