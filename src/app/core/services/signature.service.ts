import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private signature = new BehaviorSubject<string>('');
  setSignature(data: string) {
    this.signature.next(data);
  }

  convertBase64ToFile(content: string, fileName: string): File {
    const byteCharacters = atob(content); // Decodificar base64
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' }); // Puedes ajustar el tipo según lo que necesites

    // Crear un archivo a partir del Blob
    return new File([blob], fileName, { type: 'image/png' });
  }

  getSignature() {
    return this.signature.asObservable();
  }
}
