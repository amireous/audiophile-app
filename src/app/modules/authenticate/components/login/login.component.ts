import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  constructor(
    private _localStorage: StorageService,
    private _router: Router,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.initForm()
  }

  initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('',[Validators.required, Validators.email]),
      password: new FormControl('',[Validators.required]),
    });
  }

  submitForm(): void {
    this.dataService.getAddedProducts().subscribe(data => {
      console.log(data, 'sdsdsd')
    })
    let data = this.loginForm.value;
    this._localStorage.setItem('access', data);
    this._router.navigate(['/']);
  }
}
