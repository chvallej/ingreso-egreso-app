import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  setDoc,
  addDoc,
  getDoc,
  doc,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { AppState } from '../app.reducer';
import { Store } from '@ngrx/store';
import { setUser, unSetUser } from '../auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public auth: Auth,
    public firestore: Firestore,
    private store: Store<AppState>
  ) {}

  initAuthListener() {
    // this.auth.onAuthStateChanged((fuser) => {
    //   console.log(fuser);
    // });
    authState(this.auth).subscribe(async (fuser) => {
      console.log(fuser);
      if (fuser) {
        //Existe
        const docSnap = await getDoc(
          doc(this.firestore, `${fuser.uid}/usuario`)
        );
        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data());
          this.store.dispatch(
            setUser({ user: Usuario.fromFirebase(docSnap.data()) })
          );
        } else {
          // docSnap.data() will be undefined in this case
          console.log('No such document!');
        }
      } else {
        //No Existe
        this.store.dispatch(unSetUser());
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      ({ user }) => {
        const newUser = new Usuario(user.uid, nombre, user.email);
        return setDoc(doc(this.firestore, `${user.uid}/usuario`), {
          ...newUser,
        });
      }
    );
  }

  loginUsuario(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return authState(this.auth).pipe(map((fbUser) => fbUser != null));
  }
}
