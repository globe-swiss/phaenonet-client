import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Role } from './role';

@Directive({
  selector: '[appRemoveNotAuthorized]'
})
export class RemoveNotAuthorizedDirective implements OnInit {
  // weakest role by default
  @Input('appRemoveNotAuthorized')
  role: Role = 'USER';

  constructor(private elementRef: ElementRef, private authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn() || !this.authService.hasRole(this.role)) {
      this.elementRef.nativeElement.remove();
    }
  }
}
