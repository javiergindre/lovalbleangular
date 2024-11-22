import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import SignaturePad from 'signature_pad';
import { SignatureService } from 'src/app/core/services/signature.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css',
})
export class SignatureComponent implements OnInit {
  signatureNeeded: boolean = true;
  signaturePad!: SignaturePad;
  signatureImg!: string;
  signatureService = inject(SignatureService);
  isSigned: boolean = false;

  @ViewChild('canvas') canvasEl!: ElementRef;
  @Input() textTitle: string = '';
  @Output() signature = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<SignatureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.textTitle) {
      this.textTitle = this.data.textTitle;
    }
  }

  ngAfterViewInit() {
    this.resizeCanvas();
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    this.signaturePad.addEventListener('endStroke', () => {
      this.isSigned = !this.signaturePad.isEmpty();
      this.signatureNeeded = this.signaturePad.isEmpty();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resizeCanvas();
  }

  resizeCanvas() {
    const canvas = this.canvasEl.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
  }

  clearPad() {
    this.signaturePad.clear();
    this.isSigned = false;
    this.signatureNeeded = true;
  }

  savePad() {
    if (this.signaturePad.isEmpty()) {
      this.signatureNeeded = true;
      return;
    }

    const base64Data = this.signaturePad.toDataURL();
    this.signatureImg = base64Data;
    this.signatureNeeded = false;

    const content = base64Data.split(',')[1];

    this.signatureService.setSignature(content);
    let file = this.signatureService.convertBase64ToFile(content, 'signature');
    if (file) {
      this.signature.emit(file);
    }

    this.dialogRef.close(content);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}