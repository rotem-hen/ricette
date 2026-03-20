import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject, lastValueFrom } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

interface User {
  uid: string;
  email: string;
  role?: string;
  betaFeaturesEnabled?: boolean;
}

export enum LoginState {
  Loading,
  LoggedIn,
  LoggedOut
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;
  logout$ = new Subject<void>();
  newUser$ = new BehaviorSubject(null);
  loggedInUserId: string;
  state: LoginState = LoginState.Loading;

  errorCode2String: object = {
    'auth/invalid-email': 'האימייל לא תקין',
    'auth/user-disabled': 'אימייל לא פעיל, אנא צרו קשר',
    'auth/user-not-found': 'אימייל לא קיים',
    'auth/wrong-password': 'הסיסמה שגויה',
    'auth/email-already-in-use': 'אימייל כבר קיים במערכת',
    'auth/operation-not-allowed': 'הפעולה נכשלה (1). נסו שוב או צרו קשר',
    'auth/weak-password': 'הסיסמה לא חזקה מספיק',
    'auth/missing-android-pkg-name': 'הפעולה נכשלה (2). נסו שוב או צרו קשר',
    'auth/missing-continue-uri': 'הפעולה נכשלה (3). נסו שוב או צרו קשר',
    'auth/missing-ios-bundle-id': 'הפעולה נכשלה (4). נסו שוב או צרו קשר',
    'auth/invalid-continue-uri': 'הפעולה נכשלה (5). נסו שוב או צרו קשר',
    'auth/unauthorized-continue-uri': 'הפעולה נכשלה (6). נסו שוב או צרו קשר',
    default: 'הפעולה נכשלה (7). נסו שוב או צרו קשר'
  };

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private injector: EnvironmentInjector
  ) {
    this.user$ = afAuth.authState.pipe(
      tap(user => {
        if (user) this.updateUserData(user);
      }),
      switchMap(user =>
        user ? runInInjectionContext(this.injector, () => afs.doc<User>(`users/${user.uid}`).valueChanges()) : of(null)
      )
    );

    this.afAuth
      .getRedirectResult()
      .then(({ user }) => {
        this.setStateAndUser(user);
      })
      .catch(e => console.error(e));
    this.user$.subscribe(async user => {
      this.setStateAndUser(user);
    });
  }

  async googleSignin(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    this.state = LoginState.Loading;
    await this.afAuth.signInWithRedirect(provider);
  }

  async signOut(): Promise<boolean> {
    this.logout$.next();
    this.logout$.complete();
    await this.afAuth.signOut();
    return this.router.navigate(['/login']);
  }

  async emailSignIn(email: string, pass: string): Promise<void> {
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(email, pass);
      this.setStateAndUser(user);
    } catch (error) {
      throw new Error(this.errorCode2String[error.code] ?? this.errorCode2String['default']);
    }
  }

  async emailSignup(email: string, pass: string): Promise<void> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(email, pass);
      this.setStateAndUser(user);
    } catch (error) {
      throw new Error(this.errorCode2String[error.code] ?? this.errorCode2String['default']);
    }
  }

  async emailReset(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      throw new Error(this.errorCode2String[error.code] ?? this.errorCode2String['default']);
    }
  }

  private async updateUserData({ uid, email }: User): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = runInInjectionContext(this.injector, () =>
      this.afs.doc(`users/${uid}`)
    );
    const userData = await lastValueFrom(runInInjectionContext(this.injector, () => userRef.get()));
    if (!userData.exists) {
      this.newUser$.next(uid);
    }
    localStorage.setItem('betaFeaturesEnabled', userData?.data()?.betaFeaturesEnabled ? '1' : '0');
    return runInInjectionContext(this.injector, () => userRef.set({ uid, email }, { merge: true }));
  }

  private setStateAndUser(user: User): void {
    this.state = user ? LoginState.LoggedIn : LoginState.LoggedOut;
    this.loggedInUserId = user ? user.uid : null;
  }
}
