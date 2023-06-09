import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { Firestore, setDoc, getDoc, doc } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { AppState } from '../app.reducer';
import { Store } from '@ngrx/store';
import { setUser, unSetUser } from '../auth/auth.actions';
import { unSetItems } from '../ingreso-egreso/ingreso-egreso.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user!: Usuario | null;

  get user() {
    return this._user;
  }
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
          this._user = Usuario.fromFirebase(docSnap.data());
          this.store.dispatch(setUser({ user: this._user }));
        } else {
          // docSnap.data() will be undefined in this case
          console.log('No such document!');
        }
      } else {
        //No Existe
        this._user = null;
        this.store.dispatch(unSetUser());
        this.store.dispatch(unSetItems());
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
