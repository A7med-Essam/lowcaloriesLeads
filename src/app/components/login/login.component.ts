import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PusherService } from 'src/app/services/pusher.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  constructor(
    private _AuthService: AuthService,
    private _Router: Router,
    private _PusherService: PusherService
  ) {}

  login(data: any) {
    this._AuthService
      .signIn({ email: data.value.email, password: data.value.password })
      .subscribe((res: any) => {
        if (res.status == 1) {
          this._AuthService.saveUser(res.data);
          this._PusherService.firePusher()
          this._Router.navigate(['./home']);
        }
      });
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });

    if (this._AuthService.currentUser.getValue() != null) {
      this._Router.navigate(['./home']);
    }
  }
}
