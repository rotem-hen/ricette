import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

type P = boolean | UrlTree;

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<P> | Promise<P> | P {
    return this.authService.user$.pipe(
      take(1),
      map(u => u?.role === 'admin'),
      tap(isAdmin => {
        if (!isAdmin) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
