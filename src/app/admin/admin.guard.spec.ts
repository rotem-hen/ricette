import { AdminGuard } from './admin.guard';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  });

  function createGuard(user: any): AdminGuard {
    const authServiceMock = { user$: of(user) };
    return new AdminGuard(authServiceMock as any, routerSpy);
  }

  it('should allow access when user has admin role', (done) => {
    guard = createGuard({ uid: 'u1', email: 'a@b.com', role: 'admin' });

    (guard.canActivate(null, null) as any).subscribe((result: boolean) => {
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should deny access and redirect when user is not admin', (done) => {
    guard = createGuard({ uid: 'u1', email: 'a@b.com' });

    (guard.canActivate(null, null) as any).subscribe((result: boolean) => {
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should deny access and redirect when no user', (done) => {
    guard = createGuard(null);

    (guard.canActivate(null, null) as any).subscribe((result: boolean) => {
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
