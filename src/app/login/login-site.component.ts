import { Component, AfterViewChecked } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';
import { LoginFormComponentResult } from './login-form.component';
import { cons } from 'fp-ts/lib/Array';

@Component({
  templateUrl: './login-site.component.html'
})
export class LoginSiteComponent implements AfterViewChecked {
  constructor(private authService: AuthService, private router: Router, private navService: NavService) {}

  ngAfterViewChecked(): void {
    this.navService.setLocation('Anmeldung');
  }

  onLoginSuccess() {
    const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/';
    const url = this.router.parseUrl(redirect);

    const navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge',
      preserveFragment: true // fragement = hash without #, e.g. example.com#hello => hello
    };

    this.router.navigateByUrl(url, navigationExtras);
  }
}
