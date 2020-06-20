import { Injectable } from '@angular/core';
import { Observable, of, merge, Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { auth } from 'firebase';

interface User {
  uid: string;
  email: string;
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
  logout$ = new Subject();
  loggedInUserId: string;
  state: LoginState = LoginState.Loading;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.user$ = afAuth.authState.pipe(
      tap(user => {
        if (user) this.updateUserData(user);
      }),
      switchMap(user => (user ? afs.doc<User>(`users/${user.uid}`).valueChanges() : of(null)))
    );

    this.user$.subscribe(async user => {
      this.state = user ? LoginState.LoggedIn : LoginState.LoggedOut;
      this.loggedInUserId = user ? user.uid : null;
    });
  }

  async googleSignin(): Promise<void> {
    const provider = new auth.GoogleAuthProvider();
    this.state = LoginState.Loading;
    await this.afAuth.auth.signInWithRedirect(provider);
  }

  async signOut(): Promise<boolean> {
    this.logout$.next();
    this.logout$.complete();
    await this.afAuth.auth.signOut();
    return this.router.navigate(['/login']);
  }

  private updateUserData({ uid, email }: User): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);
    return userRef.set({ uid, email }, { merge: true });
  }
}
