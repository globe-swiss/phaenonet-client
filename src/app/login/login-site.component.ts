import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';
import { LoginFormComponent } from './login-form.component';

@Component({
  templateUrl: './login-site.component.html',
  standalone: true,
  imports: [LoginFormComponent]
})
export class LoginSiteComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Anmeldung');
  }

  onLoginSuccess(): void {
    const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/profile';
    const url = this.router.parseUrl(redirect);

    const navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge',
      preserveFragment: true // fragement = hash without #, e.g. example.com#hello => hello
    };

    void this.router.navigateByUrl(url, navigationExtras);
  }
}
