import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/auth';

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
  newUser$ = new BehaviorSubject(null);
  loggedInUserId: string;
  state: LoginState = LoginState.Loading;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.user$ = afAuth.authState.pipe(
      tap(user => {
        if (user) this.updateUserData(user);
      }),
      switchMap(user => (user ? afs.doc<User>(`users/${user.uid}`).valueChanges() : of(null)))
    );

    this.afAuth.getRedirectResult().catch(e => console.error(e));
    this.user$.subscribe(async user => {
      this.state = user ? LoginState.LoggedIn : LoginState.LoggedOut;
      this.loggedInUserId = user ? user.uid : null;
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

  private async updateUserData({ uid, email }: User): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);
    const userData = await userRef.get().toPromise();
    if (!userData.exists) {
      this.newUser$.next(uid);
    }
    return userRef.set({ uid, email }, { merge: true });
  }
}
