import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { startWith, distinctUntilChanged } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HealthService } from 'src/app/core/services/health.service';
import { LoadingStateService } from 'src/app/core/services/loading-state.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SessionService } from 'src/app/core/services/session.service';
import { HealthInvoice } from '../../../core/models/invoices/health-invoices';
import { RejectInvoiceDTO } from 'src/app/core/models/invoices/reject-invoice-dto';
import { BusinessDocumentStatus } from '../../../core/models/invoices/BusinessDocumentStatus';
import { ModalRejectReasonsComponent } from '../form-health-invoices/components/modal-reject-reasons/modal-reject-reasons.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { SafePipe } from 'src/app/pipe/safe.pipe';
import { LookupModel } from 'src/app/core/models/lookup/lookup-model';
import { ModalInvoiceDataComponent } from './modal-invoice-data/modal-invoice-data.component';

@Component({
  selector: 'app-form-credit-note',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectComponent,
    TablerIconsModule,
    SafePipe,
  ],
  templateUrl: './form-credit-note.component.html',
  styleUrls: ['./form-credit-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCreditNoteComponent implements OnInit, OnDestroy {
  creditNoteForm: FormGroup;
  isViewMode: boolean = false;
  isCreateMode: boolean = false;
  selectedFiles: File[] = [];
  private subscriptions: Subscription = new Subscription();
  safeUrls: Map<string, SafeResourceUrl> = new Map();
  invoiceGuid: string | null;
  creditNoteId: number | null;
  linkedInvoiceId: number | null;
  isLoadingFiles: boolean = true;
  taxConditionOptions: LookupModel[] = [
    { id: '7', text: 'Crédito B' },
    { id: '11', text: 'Crédito C' },
  ];
  businessDocumentStatus: BusinessDocumentStatus;
  invoiceData: HealthInvoice;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private healthService: HealthService,
    private loadingStateService: LoadingStateService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private sessionService: SessionService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.invoiceGuid = params['id'];
        this.sessionService.isProvider$.subscribe((isProvider) => {
          if (isProvider) {
            // es proveedor
            this.isCreateMode = true;
            this.isViewMode = false;
          } else {
            // es backoffice
            this.isViewMode = true;
            this.isCreateMode = false;
          }
          this.loadInvoiceData();
        });
      }
    });

    this.setupCreditNoteNumberGeneration();
  }

  watchInvoice() {
    this.dialog.open(ModalInvoiceDataComponent, {
      data: this.invoiceData,
    });
  }

  private createForm() {
    this.creditNoteForm = this.fb.group({
      pointOfSale: ['', [Validators.required, Validators.pattern(/^\d{1,5}$/)]],
      documentNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{1,8}$/)],
      ],
      creditNoteNumber: ['', Validators.required],
      amount: [
        '',
        [Validators.required, Validators.min(0), this.decimalValidator()],
      ],
      issueDate: ['', Validators.required],
      cae: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      caeExpirationDate: ['', Validators.required],
      affiliateCode: ['', Validators.required],
      affiliateName: ['', Validators.required],
      taxCondition: [''],
      taxConditionId: ['', Validators.required],
      period: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      productRequireDependency: ['', Validators.required],
    });
  }

  // Reutilizando la función decimalValidator de FormHealthInvoices
  private decimalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === '') return null; // Allow empty value
      const regex = /^\d+(\.\d{1,2})?$/; // Regex to allow only up to 2 decimals
      return regex.test(value) ? null : { invalidDecimal: true };
    };
  }

  // Reutilizando la función formatPointOfSale de FormHealthInvoices
  formatPointOfSale(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    input = input.slice(0, 5); // Limitar a 5 dígitos
    this.creditNoteForm
      .get('pointOfSale')
      ?.setValue(input, { emitEvent: true });
  }

  // Reutilizando la función formatDocumentNumber de FormHealthInvoices
  formatDocumentNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    input = input.slice(0, 8); // Limitar a 8 dígitos
    this.creditNoteForm
      .get('documentNumber')
      ?.setValue(input, { emitEvent: true });
  }

  // Nueva función para formatear el CAE
  formatCae(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    input = input.slice(0, 14); // Limitar a 14 dígitos
    this.creditNoteForm.get('cae')?.setValue(input, { emitEvent: false });
  }

  // Reutilizando la función onCaeInput de FormHealthInvoices
  onCaeInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Allow deletion (backspace) and empty input
    if (value === '') {
      return; // Allow clearing the field
    }

    // Allow only digits
    const regex = /^\d*$/;

    // If the input contains non-numeric characters, remove them
    if (!regex.test(value)) {
      input.value = value.replace(/\D/g, ''); // Remove non-numeric characters
    }

    // Ensure a max length of 14 digits
    if (value.length > 14) {
      input.value = value.slice(0, 14);
    }
  }

  // Reutilizando la función validateCaeInput de FormHealthInvoices
  validateCaeInput(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Shift',
      'Control',
      'Meta',
      'Home',
      'End',
    ];

    // Allow Shift + ArrowLeft or ArrowRight (text selection)
    const isShiftArrow =
      event.shiftKey &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight');

    // Allow Shift + Home (select to beginning) and Shift + End (select to end)
    const isShiftHome = event.shiftKey && event.key === 'Home';
    const isShiftEnd = event.shiftKey && event.key === 'End';

    // Allow Control (Cmd) + A for select all
    const isCtrlA =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a';

    // If allowed key or key combination, do not prevent the event
    if (
      allowedKeys.includes(event.key) ||
      isShiftArrow ||
      isShiftHome ||
      isShiftEnd ||
      isCtrlA
    ) {
      return;
    }

    // Prevent typing non-numeric characters except allowed keys
    if (
      isNaN(Number(event.key)) ||
      event.key === 'e' ||
      event.key === 'E' ||
      event.key === '+' ||
      event.key === '-'
    ) {
      event.preventDefault();
    }
  }

  private setupCreditNoteNumberGeneration() {
    const sub = combineLatest([
      this.creditNoteForm
        .get('pointOfSale')!
        .valueChanges.pipe(startWith(''), distinctUntilChanged()),
      this.creditNoteForm
        .get('documentNumber')!
        .valueChanges.pipe(startWith(''), distinctUntilChanged()),
    ]).subscribe(([pointOfSale, documentNumber]) => {
      this.generateCreditNoteNumber(pointOfSale, documentNumber);
    });

    this.subscriptions.add(sub);
  }

  private generateCreditNoteNumber(
    pointOfSale: string,
    documentNumber: string
  ) {
    let formattedPointOfSale = pointOfSale.padStart(5, '0');
    let formattedDocumentNumber = documentNumber.padStart(8, '0');
    const creditNoteNumber = `${formattedPointOfSale}${formattedDocumentNumber}`;
    this.creditNoteForm
      .get('creditNoteNumber')
      ?.setValue(creditNoteNumber, { emitEvent: false });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      this.selectedFiles = [files[0]];
      this.getSafeUrl(files[0]);
      this.cdr.markForCheck();
    }
  }

  removeFile(file: File, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedFiles = [];
    this.safeUrls.delete(file.name);
    URL.revokeObjectURL(this.safeUrls.get(file.name)?.toString() || '');
    this.cdr.markForCheck();
  }

  getSafeUrl(file: File): SafeResourceUrl {
    if (!this.safeUrls.has(file.name)) {
      const fileURL = URL.createObjectURL(file);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      this.safeUrls.set(file.name, safeUrl);
    }
    return this.safeUrls.get(file.name)!;
  }

  truncateFilename(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) {
      return filename;
    }
    const extension = filename.split('.').pop();
    const nameWithoutExtension = filename.substring(
      0,
      filename.lastIndexOf('.')
    );
    const truncatedName = nameWithoutExtension.substring(
      0,
      maxLength - 3 - (extension?.length || 0)
    );
    return `${truncatedName}...${extension}`;
  }
  getFileName(filePath: string): string {
    return filePath.split('/').pop() || '';
  }
  onSubmit() {
    if (this.creditNoteForm.valid) {
      const selectedOption = this.taxConditionOptions.find(option => option.id === this.creditNoteForm.value.taxConditionId);
      console.log(this.creditNoteForm.value.taxCondition);
      this.creditNoteForm.value.taxCondition = selectedOption ? selectedOption.text : '';
      const formData = new FormData();
      const creditNoteData: HealthInvoice = this.getCreditNoteDataFromForm();
      Object.keys(creditNoteData).forEach((key) => {
        formData.append(key, (creditNoteData as any)[key]);
      });

      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file, index) => {
          formData.append(`FormFiles`, file, file.name);
        });
      }

      // al confirmar enviar al close-credit
      if (this.businessDocumentStatus === BusinessDocumentStatus.Control) {
        this.saveCreditNote(formData);
      } else {
        this.closeCreditNote(formData);
      }
    } else {
      console.error('Formulario inválido:', this.creditNoteForm.errors);
    }
  }

  private closeCreditNote(formData: FormData) {
    this.loadingStateService.setLoading(true);
    this.healthService.closeCreditNote(formData).subscribe({
      next: (res) => {
        console.log('Nota de crédito creada exitosamente:', res);
        this.router.navigate(['/health/invoices/list']).then(() => {
          this.notificationService.showAlert(
            'Nota de crédito confirmada exitosamente',
            'Ok!'
          );
        });
        this.loadingStateService.setLoading(false);
      },
      error: (error) => {
        console.error('Error al crear la nota de crédito:', error);
        this.notificationService.showAlert(
          'Error al crear la nota de crédito',
          'Error'
        );
        this.loadingStateService.setLoading(false);
      },
      complete: () => {
        this.loadingStateService.setLoading(false);
      },
    });
  }

  private saveCreditNote(formData: FormData) {
    this.loadingStateService.setLoading(true);
    this.healthService.createCreditNote(formData).subscribe({
      next: (res) => {
        console.log('Nota de crédito creada exitosamente:', res);
        this.router.navigate(['/health/invoices/list']).then(() => {
          this.notificationService.showAlert(
            'Nota de crédito creada exitosamente',
            'Ok!'
          );
        });
        this.loadingStateService.setLoading(false);
      },
      error: (error) => {
        console.error('Error al crear la nota de crédito:', error);
        this.notificationService.showAlert(
          'Error al crear la nota de crédito',
          'Error'
        );
        this.loadingStateService.setLoading(false);
      },
      complete: () => {
        this.loadingStateService.setLoading(false);
      },
    });
  }

  cancelAndGoBack() {
    this.router.navigate(['/health/invoices/list']);
  }

  reject() {
    const dialogRef = this.dialog.open(ModalRejectReasonsComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingStateService.setLoading(true);
        const rejectDto: RejectInvoiceDTO = {
          guid: this.invoiceGuid ?? '',
          reason: result.reason.rejectReason + ' - ' + result.comments,
          type: result.reason.rejectionType,
        };

        this.healthService.rejectInvoice(rejectDto).subscribe({
          next: (res) => {
            this.router.navigate(['/health/invoices/list']).then(() => {
              this.loadingStateService.setLoading(false);
              this.notificationService.showAlert(
                'Nota de crédito rechazada exitosamente.',
                'Ok!'
              );
            });
          },
          error: (error) => {
            console.error('Error al rechazar la nota de crédito:', error);
            this.loadingStateService.setLoading(false);
            this.notificationService.showAlert(
              'Error al rechazar la nota de crédito',
              'Error'
            );
          },
        });
      }
    });
  }

  private getCreditNoteDataFromForm(): HealthInvoice {
    return {
      number: this.creditNoteForm.get('creditNoteNumber')?.value,
      date: this.formatDate(this.creditNoteForm.get('issueDate')?.value),
      basicAmount: parseFloat(this.creditNoteForm.get('amount')?.value),
      electronicAuthorizationNumber: this.creditNoteForm.get('cae')?.value,
      electronicAuthorizationVoidDate: this.formatDate(
        this.creditNoteForm.get('caeExpirationDate')?.value
      ),
      status: this.businessDocumentStatus,
      guid: this.invoiceGuid || '',
      id: this.creditNoteId || 0,
      linkedInvoiceId: this.linkedInvoiceId || 0,
      affiliateCode: this.creditNoteForm.get('affiliateCode')?.value,
      affiliateName: this.creditNoteForm.get('affiliateName')?.value,
      taxCondition: this.taxConditionOptions.find(
        (x) => x.id === this.creditNoteForm.get('taxConditionId')?.value
      )?.text,
      taxConditionId: this.creditNoteForm.get('taxConditionId')?.value,
      period: this.creditNoteForm.get('period')?.value,
      productCode: this.creditNoteForm.get('productCode')?.value,
      productName: this.creditNoteForm.get('productName')?.value,
      productRequireDependency: this.creditNoteForm.get(
        'productRequireDependency'
      )?.value,
    } as HealthInvoice;
  }

  private loadInvoiceData() {
    if (this.invoiceGuid) {
      setTimeout(() => {
        this.loadingStateService.setLoading(true);
      });
      this.healthService.getInvoice(this.invoiceGuid).subscribe({
        next: (invoice) => {
          this.sessionService.getSelectedTenant().subscribe((tenant) => {
            if (tenant.code === 'osmmedt') {
              this.taxConditionOptions = [
                ...this.taxConditionOptions,
                { id: '0', text: 'Crédito A' },
              ];
            }
          });

          this.invoiceData = invoice;

          this.linkedInvoiceId = invoice.id;
          this.businessDocumentStatus = invoice.status;
          this.creditNoteForm.patchValue({
            affiliateCode: invoice.affiliateCode,
            affiliateName: invoice.affiliateName,
            // taxCondition: invoice.taxCondition,
            // taxConditionId: invoice.taxConditionId.toString(),
            amount: invoice.basicAmount,
            period: invoice.period,
            productCode: invoice.productCode,
            productName: invoice.productName,
            productRequireDependency: invoice.productRequireDependency,
          });

          if (this.isViewMode) {
            // cargar los campos del template con los datos de linkedInvoice y se vean todos los archivos
            const linkedInvoice = invoice.linkedInvoice!;
            this.creditNoteForm.patchValue({
              amount: linkedInvoice.basicAmount,
              creditNoteNumber: linkedInvoice.number,
              taxCondition: linkedInvoice.taxCondition,
              taxConditionId: linkedInvoice.taxConditionId.toString(),
              issueDate: new Date(linkedInvoice.date)
                .toISOString()
                .split('T')[0],
              cae: linkedInvoice.electronicAuthorizationNumber,
              caeExpirationDate: new Date(
                linkedInvoice.electronicAuthorizationVoidDate
              )
                .toISOString()
                .split('T')[0],
            });

            this.syncFieldsWithInvoiceNumber(linkedInvoice.number);
            this.loadExistingFiles(invoice.files);
          }

          this.cdr.markForCheck();
          this.loadingStateService.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading invoice data', error);
          this.cdr.markForCheck();
          this.loadingStateService.setLoading(false);
        },
      });
    }
  }

  private syncFieldsWithInvoiceNumber(invoiceNumber: string) {
    if (invoiceNumber && invoiceNumber.length <= 13) {
      const paddedNumber = invoiceNumber.padStart(13, '0');
      const pointOfSale = paddedNumber.slice(0, 5).replace(/^0+/, ''); // Elimina ceros a la izquierda
      const documentNumber = paddedNumber.slice(5).replace(/^0+/, ''); // Elimina ceros a la izquierda

      this.creditNoteForm.patchValue(
        {
          pointOfSale: pointOfSale,
          documentNumber: documentNumber,
        },
        { emitEvent: false }
      );
    }
  }

  private loadExistingFiles(files: any[]) {
    const fileLoadPromises = files.map((fileData) => {
      return new Promise<void>((resolve) => {
        const blob = this.base64ToBlob(fileData.content, 'application/pdf');
        const file = new File([blob], fileData.fileName, {
          type: 'application/pdf',
        });
        this.addFile(file);
        resolve();
      });
    });

    Promise.all(fileLoadPromises).then(() => {
      this.loadingStateService.setLoading(false);
      this.isLoadingFiles = false;
      this.cdr.markForCheck();
    });
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  addFile(file: File) {
    this.selectedFiles.push(file);
    this.getSafeUrl(file);
    this.updateFormFiles();
    this.cdr.markForCheck();
  }

  updateFormFiles() {
    this.creditNoteForm.patchValue({ files: this.selectedFiles });
  }

  isFormValid(): boolean {
    console.log(this.creditNoteForm.status); // Log overall form status ('VALID', 'INVALID')
  console.log(this.creditNoteForm.errors); // Log form-level errors if any
  console.log(this.creditNoteForm.controls); // Log all form controls

  // Loop through each control to see its validation state
  Object.keys(this.creditNoteForm.controls).forEach((key) => {
    const control = this.creditNoteForm.get(key);
    console.log(`${key} control is valid: `, control?.valid);
    console.log(`${key} control errors: `, control?.errors);
  });

    return this.creditNoteForm.valid && this.selectedFiles.length > 0;
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
