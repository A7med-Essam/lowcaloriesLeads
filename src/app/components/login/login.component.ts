import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GuardService } from 'src/app/services/guard.service';
import { LocalService } from 'src/app/services/local.service';
import { PusherService } from 'src/app/services/pusher.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  signInStatus: boolean = false;
  loginForm!: FormGroup;
  constructor(
    private _GuardService: GuardService,
    private _AuthService: AuthService,
    private _Router: Router,
    private _PusherService: PusherService,
    private _LocalService:LocalService
  ) {}

  ngOnInit() {
    this.createLoginForm();
    if (this._GuardService.getUser()) {
      this._Router.navigate(['./home']);
    }
  }

  login(data: FormGroup) {
    this.signInStatus = true;
    if (data.valid) {
      this._AuthService
        .signIn({ email: data.value.email, password: data.value.password })
        .subscribe((res) => {
          this.signInStatus = false;
          if (res.status === 1) {
            this._AuthService.saveUser(res.data);
            this._PusherService.firePusher();
            const returnUrl = this._AuthService.returnUrl.value;
            const navigationUrl = returnUrl ? returnUrl : '/home';
            this._AuthService.returnUrl.next(null)
            this._Router.navigateByUrl(navigationUrl);
          }
        });
    }
  }

  createLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }
}
