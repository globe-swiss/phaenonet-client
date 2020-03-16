import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appDisableNotOwner]'
})
export class DisableNotOwnerDirective implements AfterViewInit {
  @Input('appDisableNotOwner')
  owner: string = '';

  constructor(private elementRef: ElementRef, private authService: AuthService) {}

  ngAfterViewInit() {
    if (!this.authService.isLoggedIn() || this.authService.getUserId() !== this.owner) {
      this.elementRef.nativeElement.disabled = true;
    }
  }
}
