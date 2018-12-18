import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  constructor() { }

  simplificationFormControl = new FormControl(5, [
    Validators.required,
    Validators.min(0),
    Validators.max(10)
  ]);
  topKFormControl = new FormControl(5, [
    Validators.required,
    Validators.min(0),
    Validators.max(30)
  ]);
  maxNearestFormControl = new FormControl(1, [
    Validators.required,
    Validators.min(0),
    Validators.max(10)
  ]);
  mbrMarginFormControl = new FormControl(3, [
    Validators.required,
    Validators.min(0),
    Validators.max(10)
  ]);
  matcher = new MyErrorStateMatcher();
  costFunctions = [
    'sqrtMultiply',
    'sqrtPlus',
    'arithmeticMean',
    'geometricMean',
    'distance',
    'time',
    'roadType',
    'minimum',
    'maximum'
  ];
  selectedCostFunction = this.costFunctions[2];
  skyline = true;
  yenKeep = true;

  valid(): boolean {
    return this.maxNearestFormControl.valid
        && this.mbrMarginFormControl.valid
        && this.simplificationFormControl.valid
        && this.topKFormControl.valid;
  }
}
