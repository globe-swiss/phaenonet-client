import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras
} from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './role';

@Injectable()
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    return this.checkRole(url, this.getRouteRoles(route));
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  checkRole(url: string, roles: Array<Role>): boolean {
    for (const role of roles) {
      if (this.authService.hasRole(role)) {
        return true;
      }
    }
    return false;
  }

  private getRouteRoles(currentRoute: ActivatedRouteSnapshot): Array<Role> {
    let route = currentRoute;
    while (route) {
      const roles = route.data['roles'] as Array<Role>;
      if (roles) {
        return roles;
      }
      if (route.parent) {
        route = route.parent;
      }
    }
    return ['ADMIN'];
  }
}
