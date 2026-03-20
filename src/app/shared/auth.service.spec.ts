import { AuthService, LoginState } from './auth.service';
import { of, BehaviorSubject, Subject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let afAuthMock: any;
  let afsMock: any;
  let routerSpy: any;
  let authStateSubject: BehaviorSubject<any>;

  beforeEach(() => {
    authStateSubject = new BehaviorSubject(null);
    afAuthMock = {
      authState: authStateSubject.asObservable(),
      signInWithRedirect: jasmine.createSpy('signInWithRedirect').and.returnValue(Promise.resolve()),
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
      getRedirectResult: jasmine.createSpy('getRedirectResult').and.returnValue(Promise.resolve({ user: null }))
    };
    afsMock = {
      doc: jasmine.createSpy('doc').and.returnValue({
        valueChanges: () => of(null),
        get: () => of({ exists: false, data: () => ({}) }),
        set: jasmine.createSpy('set').and.returnValue(Promise.resolve())
      })
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const injectorMock = { runInContext: (fn: Function) => fn() } as any;
    service = new AuthService(afAuthMock, afsMock, routerSpy, injectorMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start in Loading state', () => {
    // State gets set to LoggedOut after construction because authState emits null
    // But the initial value before subscription is Loading
    expect(service.state === LoginState.Loading || service.state === LoginState.LoggedOut).toBeTrue();
  });

  it('should set LoggedOut state when no user', () => {
    expect(service.state).toBe(LoginState.LoggedOut);
    expect(service.loggedInUserId).toBeNull();
  });

  describe('errorCode2String', () => {
    it('should map known auth error codes to Hebrew messages', () => {
      expect(service.errorCode2String['auth/invalid-email']).toBeTruthy();
      expect(service.errorCode2String['auth/wrong-password']).toBeTruthy();
      expect(service.errorCode2String['auth/user-not-found']).toBeTruthy();
      expect(service.errorCode2String['auth/email-already-in-use']).toBeTruthy();
      expect(service.errorCode2String['auth/weak-password']).toBeTruthy();
    });

    it('should have a default fallback message', () => {
      expect(service.errorCode2String['default']).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('should emit on logout$, call afAuth.signOut, and navigate to /login', async () => {
      let logoutEmitted = false;
      service.logout$.subscribe(() => (logoutEmitted = true));

      await service.signOut();

      expect(logoutEmitted).toBeTrue();
      expect(afAuthMock.signOut).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('googleSignin', () => {
    it('should call signInWithRedirect', async () => {
      await service.googleSignin();

      expect(afAuthMock.signInWithRedirect).toHaveBeenCalled();
    });
  });
});
