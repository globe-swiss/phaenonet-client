import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appDisableNotAuthorized]'
})
export class DisableNotAuthorizedDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef, private authService: AuthService) {}

  ngAfterViewInit() {
    if (!this.authService.isLoggedIn()) {
      this.elementRef.nativeElement.disabled = true;
    }
  }
}
