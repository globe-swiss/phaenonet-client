import { Directive, ElementRef, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appRemoveNotAuthorized]',
  standalone: true
})
export class RemoveNotAuthorizedDirective implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.elementRef.nativeElement.remove();
    }
  }
}
