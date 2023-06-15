import { Injectable } from '@angular/core';
import { IngresoEgreso } from '../models/ingreso-egreso.model';
import { AuthService } from './auth.service';
import {
  Firestore,
  addDoc,
  doc,
  collection,
  collectionData,
  collectionSnapshots,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IngresoEgresoService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  crearIngresoEgreso(ingresoEgreso: IngresoEgreso) {
    const uid = this.authService.user?.uid;
    const collectionReference = collection(
      this.firestore,
      `${uid}/ingresos-egresos/items`
    );
    return addDoc(collectionReference, { ...ingresoEgreso });
  }

  initIngresosEgresosListener(uid: string | undefined) {
    const collectionReference = collection(
      this.firestore,
      `${uid}/ingresos-egresos/items`
    );
    return collectionSnapshots(collectionReference).pipe(
      map((snapshot) => {
        return snapshot.map((doc) => {
          return {
            uid: doc.id,
            ...doc.data(),
          };
        });
      })
    );
  }

  borrarIngresoEgreso(uidItem: string | undefined) {
    const uid = this.authService.user?.uid;
    const documentReference = doc(
      this.firestore,
      `${uid}/ingresos-egresos/items/${uidItem}`
    );
    return deleteDoc(documentReference);
  }
}
