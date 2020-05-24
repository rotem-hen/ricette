import { Injectable } from '@angular/core';
import { Observable, of, merge } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { auth } from 'firebase';

interface User {
  uid: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.user$ = afAuth.authState.pipe(
      switchMap(user => (user ? afs.doc<User>(`users/${user.uid}`).valueChanges() : of(null)))
    );
  }

  async googleSignin(): Promise<void> {
    const provider = new auth.GoogleAuthProvider();
    const credentials = await this.afAuth.auth.signInWithPopup(provider);
    this.updateUserData(credentials.user);
    this.router.navigate(['/categories']);
  }

  async signOut(): Promise<boolean> {
    await this.afAuth.auth.signOut();
    return this.router.navigate(['/login']);
  }

  private updateUserData({ uid, email }: User): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);
    return userRef.set({ uid, email }, { merge: true });
  }
}
