import { AuthGuard } from './auth.guard';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: any;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  });

  function createGuard(user: any): AuthGuard {
    authServiceMock = {
      user$: of(user)
    };
    return new AuthGuard(authServiceMock, routerSpy);
  }

  it('should allow access when user is logged in', (done) => {
    guard = createGuard({ uid: 'user1', email: 'test@test.com' });

    (guard.canActivate(null, null) as any).subscribe((result: boolean) => {
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should deny access and redirect to /login when no user', (done) => {
    guard = createGuard(null);

    (guard.canActivate(null, null) as any).subscribe((result: boolean) => {
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
