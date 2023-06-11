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
  doc,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public auth: Auth, public firestore: Firestore) {}

  initAuthListener() {
    this.auth.onAuthStateChanged((fuser) => {
      console.log(fuser);
    });
    authState(this.auth).subscribe((fuser) => {
      console.log(fuser);
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
