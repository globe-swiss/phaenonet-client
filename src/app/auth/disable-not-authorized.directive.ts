import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Role } from './role';

@Directive({
  selector: '[appDisableNotAuthorized]'
})
export class DisableNotAuthorizedDirective implements AfterViewInit {
  // weakest role by default
  @Input('appDisableNotAuthorized')
  role: Role = 'USER';

  constructor(private elementRef: ElementRef, private authService: AuthService) {}

  ngAfterViewInit() {
    if (!this.authService.isLoggedIn() || !this.authService.hasRole(this.role)) {
      this.elementRef.nativeElement.disabled = true;
    }
  }
}
