import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription, combineLatest, of } from 'rxjs';
import {
  startWith,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { LookupService } from 'src/app/core/services/lookup.service';
import { HealthService } from 'src/app/core/services/health.service';
import { HealthInvoice } from '../../../core/models/invoices/health-invoices';
import { generateGuid } from './functions/generate-guid';
import { CommonModule } from '@angular/common';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafePipe } from 'src/app/pipe/safe.pipe';
import { HttpResponse } from '@angular/common/http';
import { LoadingStateService } from 'src/app/core/services/loading-state.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SessionService } from 'src/app/core/services/session.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { ModalRejectReasonsComponent } from './components/modal-reject-reasons/modal-reject-reasons.component';
import { RejectInvoiceDTO } from 'src/app/core/models/invoices/reject-invoice-dto';
import { BusinessDocumentStatus } from '../../../core/models/invoices/BusinessDocumentStatus';
import { environment } from 'src/environments/environment';
import { endpoints } from 'src/app/core/helpers/endpoints';
import {
  LookupComponent,
  LookupConfig,
} from 'src/app/components/lookup/lookup.component';

export function decimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '') return null; // Allow empty value
    const regex = /^\d+(\.\d{1,2})?$/; // Regex to allow only up to 2 decimals
    return regex.test(value) ? null : { invalidDecimal: true };
  };
}

export function greaterThanZeroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // Verifica que el valor sea mayor que cero
    return value && value > 0 ? null : { greaterThanZero: true };
  };
}

@Component({
  selector: 'app-form-health-invoices',
  templateUrl: './form-health-invoices.component.html',
  imports: [
    // no se usan
    // NgLabelTemplateDirective,
    // NgOptionTemplateDirective,
    // NgSelectComponent,
    // SafePipe,
    
    LookupComponent,
    TablerIconsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./form-health-invoices.component.scss'],
})
export class FormHealthInvoicesComponent implements OnInit, OnDestroy {
  healthInvoiceForm: FormGroup;
  invoiceGuid: string | null;
  selectedFiles: File[] = [];
  private subscriptions: Subscription = new Subscription();
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  isApproveMode: boolean = false;
  isOnlyViewMode: boolean = false;
  invoiceId: number | null;
  treatmentRequestPracticeId: number | null;
  productName: string;
  affiliateName: string;
  productRequireDependency: string;
  safeUrls: Map<string, SafeResourceUrl> = new Map();
  isLoadingFiles: boolean = false;
  taxConditionName: string;
  isQuantityVisible: boolean = false;
  isInvoiceLoaded: boolean = false;
  providerId?: number | null;
  businessDocumentStatus: BusinessDocumentStatus;
  issuerName: string | null;
  queryParams = {};
  isProvider: boolean = false;

  productDependencyOptions = [
    { value: 'S', viewValue: 'SI' },
    { value: 'N', viewValue: 'NO' },
  ];

  constructor(
    private fb: FormBuilder,
    private healthService: HealthService,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private loadingStateService: LoadingStateService,
    private notificationService: NotificationService,
    private sessionService: SessionService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.invoiceGuid = params['id'];

        this.sessionService.isProvider$.subscribe((isProvider) => {
          this.isProvider = isProvider;
          if (isProvider) {
            // es proveedor
            this.isViewMode = true;
            this.isEditMode = false;
          } else {
            // es backoffice
            this.isViewMode = false;
            this.isEditMode = false;
            this.isApproveMode = true;
          }
        });

        this.determineOnlyViewMode();
        this.loadInvoice();
      } else {
        this.invoiceGuid = null;
        this.isViewMode = false;
        this.isEditMode = false;
      }
    });

    this.setupInvoiceNumberGeneration();
    this.setupInvoiceNumberSync();
  }

  private determineOnlyViewMode() {
    this.route.url.subscribe((segments) => {
      this.isOnlyViewMode = segments.some((segment) => segment.path === 'view');
      if (this.isOnlyViewMode) {
        this.healthInvoiceForm.get('productCode')?.disable();

        this.isViewMode = true;
      }
    });
  }

  private createForm() {
    this.healthInvoiceForm = this.fb.group({
      issuerId: [''],
      pointOfSale: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          greaterThanZeroValidator(),
        ],
      ],
      documentNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          greaterThanZeroValidator(),
        ],
      ],
      number: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern(/^\d{1,13}$/)],
      ],
      affiliateCode: [null, Validators.required],
      date: ['', Validators.required],
      basicAmount: ['', Validators.required],
      taxCondition: [null, Validators.required],
      electronicAuthorizationNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{14}$/)],
      ],
      electronicAuthorizationVoidDate: ['', Validators.required],
      period: [null, Validators.required],
      productCode: [{ value: null, disabled: true }, Validators.required],
      productRequireDependency: ['N', Validators.required],
      quantity: [{ value: null, disabled: true }],
      files: [[]],
    });
  }

  private loadInvoice() {
    if (this.invoiceGuid) {
      this.isLoadingFiles = true;

      this.healthService.getInvoice(this.invoiceGuid).subscribe({
        next: (invoice) => {
          this.businessDocumentStatus = invoice.status;
          this.updateQuantityFieldState(invoice.productCode);
          this.syncFieldsWithInvoiceNumber(invoice.number);

          this.issuerName = invoice.issuerName;
          this.affiliateName = invoice.affiliateName;
          this.productName = invoice.productName;

          this.healthInvoiceForm.patchValue({
            issuerId: invoice.issuerId,
            taxCondition: invoice.taxConditionId,
            affiliateCode: parseInt(invoice.affiliateCode),
            period: invoice.period,
            productCode: parseInt(invoice.productCode),
            date: invoice.date,
            basicAmount: invoice.basicAmount,
            electronicAuthorizationNumber:
              invoice.electronicAuthorizationNumber,
            electronicAuthorizationVoidDate:
              invoice.electronicAuthorizationVoidDate,
            productRequireDependency: invoice.productRequireDependency,
            quantity: invoice.quantity,
            files: invoice.files,
          });

          if (!this.isProvider) {
            // Actualizas los additionalParams de los LookupConfig solo si isProvider es falso
            this.affiliateLookupConfig = {
              ...this.affiliateLookupConfig,
              additionalParams: {
                ...this.affiliateLookupConfig.additionalParams,
                issuerId: invoice.issuerId,
              },
            };

            this.productLookupConfig = {
              ...this.productLookupConfig,
              additionalParams: {
                ...this.productLookupConfig.additionalParams,
                issuerId: invoice.issuerId,
              },
            };
          }

          // Habilita el campo 'productCode' si 'affiliateCode' tiene valor
          if (this.healthInvoiceForm.get('affiliateCode')?.value) {
            this.healthInvoiceForm.get('productCode')?.enable();
          }

          this.invoiceId = invoice.id;

          this.productRequireDependency =
            invoice.productRequireDependency.trim();

          // Cargar archivos existentes
          if (invoice.files && invoice.files.length > 0) {
            this.loadExistingFiles(invoice.files);
          } else {
            this.isLoadingFiles = false;
          }

          if (this.isViewMode) this.disableFormFields();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al cargar los datos de la factura', error);
          this.isLoadingFiles = false;
          this.cdr.markForCheck();
        },
        complete: () => {
          this.isInvoiceLoaded = true;
        },
      });
    }
  }

  onAmountInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove extra decimals if more than 2 decimal places are entered
    const sanitizedValue = parseFloat(value).toFixed(2);
    if (value.includes('.') && value.split('.')[1].length > 2) {
      input.value = sanitizedValue;
    }
  }

  preventEKey(event: KeyboardEvent): void {
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

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

  getFileName(filePath: string): string {
    return filePath.split('/').pop() || '';
  }

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

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const newFile = files[i];
      const exists = this.selectedFiles.some(
        (file) => file.name === newFile.name && file.size === newFile.size
      );
      // Add the file only if it doesn't exist in the array
      if (!exists && newFile.type === 'application/pdf') {
        this.addFile(newFile);
      }
    }
    // Reset the file input value to ensure change detection works correctly
    event.target.value = '';
  }

  removeFile(file: File, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      // Remove the file from the selectedFiles array
      this.selectedFiles.splice(index, 1);

      // Remove the corresponding safe URL
      const safeUrl = this.safeUrls.get(file.name);
      if (safeUrl) {
        this.safeUrls.delete(file.name);
        URL.revokeObjectURL(safeUrl.toString());
      }

      // Update the form control
      this.updateFormFiles();
      this.cdr.markForCheck();
    }
  }

  getSafeUrl(file: File): SafeResourceUrl {
    if (!this.safeUrls.has(file.name)) {
      const fileURL = URL.createObjectURL(file);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      this.safeUrls.set(file.name, safeUrl);
    }
    return this.safeUrls.get(file.name)!;
  }

  updateFormFiles() {
    this.healthInvoiceForm.patchValue({ files: this.selectedFiles });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.enableFormFields();
    } else {
      this.disableFormFields();
    }
  }

  private enableFormFields() {
    Object.keys(this.healthInvoiceForm.controls).forEach((key) => {
      const control = this.healthInvoiceForm.get(key);
      if (control && key !== 'number') {
        control.enable();
      }
    });
  }

  private disableFormFields() {
    Object.keys(this.healthInvoiceForm.controls).forEach((key) => {
      const control = this.healthInvoiceForm.get(key);
      if (control) {
        control.disable();
      }
    });
  }

  private setupInvoiceNumberSync() {
    this.healthInvoiceForm.get('number')?.valueChanges.subscribe((value) => {
      if (value && value.length === 13) {
        this.syncFieldsWithInvoiceNumber(value);
      }
    });
  }

  private setupInvoiceNumberGeneration() {
    const sub = combineLatest([
      this.healthInvoiceForm
        .get('pointOfSale')!
        .valueChanges.pipe(startWith(''), distinctUntilChanged()),
      this.healthInvoiceForm
        .get('documentNumber')!
        .valueChanges.pipe(startWith(''), distinctUntilChanged()),
    ]).subscribe(([pointOfSale, documentNumber]) => {
      this.generateInvoiceNumber(pointOfSale, documentNumber);
    });

    this.subscriptions.add(sub);
  }

  private generateInvoiceNumber(pointOfSale: string, documentNumber: string) {
    let formattedPointOfSale = pointOfSale.padStart(5, '0');
    let formattedDocumentNumber = documentNumber.padStart(8, '0');

    const invoiceNumber = `${formattedPointOfSale}${formattedDocumentNumber}`;
    this.healthInvoiceForm
      .get('number')
      ?.setValue(invoiceNumber.slice(-13), { emitEvent: false });
  }

  getInvoiceDataFromForm(): HealthInvoice {
    const invoiceData: HealthInvoice = {
      number: this.healthInvoiceForm.get('number')?.value,
      affiliateCode: this.healthInvoiceForm
        .get('affiliateCode')
        ?.value.toString(),
      affiliateName:
        this.affiliateName ??
        this.healthInvoiceForm.get('affiliateName')?.value,
      date: this.formatDate(this.healthInvoiceForm.get('date')?.value),
      basicAmount: parseFloat(this.healthInvoiceForm.get('basicAmount')?.value),
      taxCondition: this.healthInvoiceForm
        .get('taxCondition')
        ?.value.toString(),
      taxConditionId: 0, //this.healthInvoiceForm.get('taxCondition')?.value,
      taxAmount: 0,
      electronicAuthorizationNumber: this.healthInvoiceForm.get(
        'electronicAuthorizationNumber'
      )?.value,
      electronicAuthorizationVoidDate: this.formatDate(
        this.healthInvoiceForm.get('electronicAuthorizationVoidDate')?.value
      ),
      status: BusinessDocumentStatus.Emitted,
      concept: '',
      period: this.healthInvoiceForm.get('period')?.value,
      productCode: this.healthInvoiceForm.get('productCode')?.value.toString(),
      productName: this.productName,
      productRequireDependency: this.productRequireDependency,
      comments: '',
      guid: this.invoiceGuid ? this.invoiceGuid : generateGuid(),
      id: this.invoiceId ?? 0,
      issuerName: '',
      quantity: parseFloat(this.healthInvoiceForm.get('quantity')?.value) || 0,
      createDate: new Date().toISOString(),
      treatmentRequestPracticeId: this.treatmentRequestPracticeId ?? 0,
      linkedInvoiceId: 0,
      linkedInvoice: null,
      files: [],
    };

    return invoiceData;
  }

  onSubmit() {
    if (this.healthInvoiceForm.valid) {
      const formData = new FormData();
      const invoiceData: HealthInvoice = this.getInvoiceDataFromForm();
      Object.keys(invoiceData).forEach((key) => {
        formData.append(key, (invoiceData as any)[key]);
      });

      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file, index) => {
          formData.append(`FormFiles`, file, file.name);
        });
      }
      if (this.invoiceGuid) {
        if (
          this.businessDocumentStatus ===
          BusinessDocumentStatus.PendingAttachments
        ) {
          console.log('Confirm existing invoice');
          this.confirmInvoice(formData);
        } else {
          console.log('Updating existing invoice');
          this.updateInvoice(formData);
        }
      } else {
        console.log('Creating new invoice');
        this.createInvoice(formData);
      }
    } else {
      console.error('Formulario inválido:', this.healthInvoiceForm.errors);
      this.logInvalidControls(this.healthInvoiceForm);
    }
  }

  private confirmInvoice(invoice: FormData) {
    this.loadingStateService.setLoading(true);
    this.checkFilters();
    this.healthService
      .confirmInvoiceForm(invoice)
      .pipe(
        filter(
          (event): event is HttpResponse<any> => event instanceof HttpResponse
        )
      )
      .subscribe({
        next: (res) => {
          console.log('Factura creada exitosamente:', res);
          this.router
            .navigate(['/health/invoices/list'], {
              queryParams: this.queryParams,
            })
            .then(() => {
              this.notificationService.showAlert(
                'Factura editada exitosamente',
                'Ok!'
              );
            });
        },
        error: (error) => {
          console.error('Error al actualizar la factura:', error);
          // Manejar el error (por ejemplo, mostrar un mensaje de error)
        },
        complete: () => {
          this.loadingStateService.setLoading(false);
        },
      });
  }

  private createInvoice(formData: FormData) {
    // show loader
    this.checkFilters();
    this.loadingStateService.setLoading(true);
    this.healthService
      .createInvoice(formData)
      .pipe(
        filter(
          (event): event is HttpResponse<any> => event instanceof HttpResponse
        )
      )
      .subscribe({
        next: (res) => {
          console.log('Factura creada exitosamente:', res);
          this.router
            .navigate(['/health/invoices/list'], {
              queryParams: this.queryParams,
            })
            .then(() => {
              this.notificationService.showAlert(
                'Factura creada exitosamente',
                'Ok!'
              );
            });
        },
        error: (error) => {
          console.error('Error al crear la factura:', error);
          this.loadingStateService.setLoading(false);
          this.notificationService.showAlert(error, 'Error!');
          // Manejar el error (por ejemplo, mostrar un mensaje de error)
          // Manejar el error (por ejemplo, mostrar un mensaje de error)
        },
        complete: () => {
          this.loadingStateService.setLoading(false);
        },
      });
  }

  private updateInvoice(formData: FormData) {
    // show loader
    this.checkFilters();
    this.loadingStateService.setLoading(true);
    this.healthService
      .updateInvoice(formData)
      .pipe(
        filter(
          (event): event is HttpResponse<any> => event instanceof HttpResponse
        )
      )
      .subscribe({
        next: (res) => {
          console.log('Factura creada exitosamente:', res);
          this.router
            .navigate(['/health/invoices/list'], {
              queryParams: this.queryParams,
            })
            .then(() => {
              this.notificationService.showAlert(
                'Factura editada exitosamente',
                'Ok!'
              );
            });
        },
        error: (error) => {
          console.error('Error al actualizar la factura:', error);
          // Manejar el error (por ejemplo, mostrar un mensaje de error)
        },
        complete: () => {
          this.loadingStateService.setLoading(false);
        },
      });
  }

  onTaxConditionChange(selectedTaxCondition: any) {
    console.log('Tax Condition changed:', selectedTaxCondition);
    this.taxConditionName = selectedTaxCondition
      ? selectedTaxCondition.text
      : '';
  }

  private updateQuantityFieldState(productCode: string | null) {
    const quantityControl = this.healthInvoiceForm.get('quantity');
    this.sessionService.getSelectedTenant().subscribe((tenant) => {
      if (tenant) {
        if (tenant.code === 'osmmedt') {
          if (productCode === '96') {
            quantityControl?.enable();
            this.isQuantityVisible = true;
          } else {
            quantityControl?.disable();
            quantityControl?.setValue(null);
            this.isQuantityVisible = false;
          }
        }
        if (tenant.code === 'premedic') {
          if (productCode === '86') {
            quantityControl?.enable();
            this.isQuantityVisible = true;
          } else {
            quantityControl?.disable();
            quantityControl?.setValue(null);
            this.isQuantityVisible = false;
          }
        }
        this.cdr.detectChanges(); // Asegúrate de que los cambios se detecten
      }
    });
  }

  onProductChange(selectedProduct: any) {
    this.updateQuantityFieldState(selectedProduct?.id.toString());
    this.treatmentRequestPracticeId =
      selectedProduct?.customData?.treatmentRequestPracticeId;
    this.productName = selectedProduct?.text || '';
    this.productRequireDependency =
      selectedProduct?.customData?.dependency || 'N';
  }

  formatPointOfSale(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    this.healthInvoiceForm
      .get('pointOfSale')
      ?.setValue(input, { emitEvent: true });
  }

  formatDocumentNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    this.healthInvoiceForm
      .get('documentNumber')
      ?.setValue(input, { emitEvent: true });
  }

  formatPeriod(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 6) {
      input = input.substr(0, 6);
    }
    if (input.length >= 2) {
      const month = input.substr(0, 2);
      const year = input.substr(2);
      input = `${month}${year}`;
    }
    this.healthInvoiceForm.get('period')?.setValue(input, { emitEvent: false });
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

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
  }

  logInvalidControls(form: FormGroup) {
    console.log(this.healthInvoiceForm.get('taxCondition')?.value);

    const invalidControls = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    console.log('Campos no válidos:', invalidControls);

    Object.keys(this.healthInvoiceForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null | undefined =
        this.healthInvoiceForm.get(key)?.errors;
      if (controlErrors) {
        console.log('Error en el control:', key, controlErrors);
      }
    });
  }

  isFieldIncomplete(fieldName: string): boolean {
    const control = this.healthInvoiceForm.get(fieldName);
    return control
      ? (control.dirty || control.touched) && control.invalid
      : false;
  }

  // Método para sincronizar los campos individuales con el número de factura
  private syncFieldsWithInvoiceNumber(invoiceNumber: string) {
    if (invoiceNumber && invoiceNumber.length <= 13) {
      const paddedNumber = invoiceNumber.padStart(13, '0');
      const pointOfSale = paddedNumber.slice(0, 5).replace(/^0+/, ''); // Elimina ceros a la izquierda
      const documentNumber = paddedNumber.slice(5).replace(/^0+/, ''); // Elimina ceros a la izquierda

      this.healthInvoiceForm.patchValue(
        {
          pointOfSale: pointOfSale,
          documentNumber: documentNumber,
        },
        { emitEvent: true }
      );
    }
  }

  // Método para manejar cambios en el número de factura
  onInvoiceNumberChange(event: any) {
    const invoiceNumber = event.target.value;
    this.syncFieldsWithInvoiceNumber(invoiceNumber);
  }

  // Método para resetear el formulario
  resetForm() {
    this.healthInvoiceForm.reset();
    this.selectedFiles = [];
    if (!this.isEditMode) {
      this.healthInvoiceForm.patchValue({
        productRequireDependency: 'N',
      });
    }
  }

  // Método para navegar de vuelta a la lista de facturas
  cancelAndGoBack() {
    this.checkFilters();
    this.router.navigate(['/health/invoices/list'], {
      queryParams: this.queryParams,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isFormValid(): boolean {
    return this.healthInvoiceForm.valid && this.selectedFiles.length > 0;
  }

  readonly dialog = inject(MatDialog);
  approve() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmación',
        message: 'Desea aprobar la factura?',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.checkFilters();
        const invoiceData: HealthInvoice = this.getInvoiceDataFromForm();
        this.loadingStateService.setLoading(true);

        this.healthService
          .approveInvoice(invoiceData)
          .pipe(
            filter(
              (event): event is HttpResponse<any> =>
                event instanceof HttpResponse
            )
          )
          .subscribe({
            next: (res) => {
              this.router
                .navigate(['/health/invoices/list'], {
                  queryParams: this.queryParams,
                })
                .then(() => {
                  this.loadingStateService.setLoading(false);
                  this.notificationService.showAlert(
                    'Factura aprobada exitosamente.',
                    'Ok!'
                  );
                });
            },
            error: (error) => {
              this.router
                .navigate(['/health/invoices/list'], {
                  queryParams: this.queryParams,
                })
                .then(() => {
                  this.loadingStateService.setLoading(false);
                  this.notificationService.showAlert(error, 'Error!');
                });
            },
          });
      }
    });
  }

  readonly rejectDialog = inject(MatDialog);
  reject() {
    const dialogRef = this.rejectDialog.open(ModalRejectReasonsComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.checkFilters();
        this.loadingStateService.setLoading(true);
        const rejectDto: RejectInvoiceDTO = {
          guid: this.invoiceGuid ?? '',
          reason: result.reason.rejectReason + ' - ' + result.comments,
          type: result.reason.rejectionType,
        };

        this.healthService
          .rejectInvoice(rejectDto)
          .pipe(
            filter(
              (event): event is HttpResponse<any> =>
                event instanceof HttpResponse
            )
          )
          .subscribe({
            next: (res) => {
              this.router
                .navigate(['/health/invoices/list'], {
                  queryParams: this.queryParams,
                })
                .then(() => {
                  this.loadingStateService.setLoading(false);
                  this.notificationService.showAlert(
                    'Factura rechazada exitosamente.',
                    'Ok!'
                  );
                });
            },
            error: (error) => {
              console.error('Error al rechazar la factura:', error);
              this.router
                .navigate(['/health/invoices/list'], {
                  queryParams: this.queryParams,
                })
                .then(() => {
                  this.loadingStateService.setLoading(false);
                  this.notificationService.showAlert(error, 'Error!');
                });
              // Manejar el error (por ejemplo, mostrar un mensaje de error)
            },
          });
      }
    });
  }

  checkFilters() {
    const currentFilter = localStorage.getItem('currentFilter');
    this.queryParams = {};

    if (currentFilter) {
      const filters = new URLSearchParams(currentFilter);
      this.queryParams = {
        affiliateName: filters.get('affiliateName') || '',
        affiliateCode: filters.get('affiliateCode') || '',
        invoiceNumber: filters.get('invoiceNumber') || '',
        providerName: filters.get('providerName') || '',
        status: filters.get('status') || '0',
        invoicePeriod: filters.get('invoicePeriod') || '',
        currentPage: filters.get('currentPage') || 1,
        pageSize: filters.get('pageSize') || 20,
      };
    }
  }

  affiliateLookupConfig: LookupConfig = {
    placeholder: 'Afiliado',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_AFFILIATES}`,
    showAddNew: false,
    errorMessage: 'Seleccione un afiliado',
    additionalParams: {
      issuerId: null, // Inicialmente null, lo actualizaremos después
    },
  };

  productLookupConfig: LookupConfig = {
    placeholder: 'Práctica',
    url: `${environment.apiUrl}${endpoints.LOOKUP_HEALTH_PRODUCT}`,
    showAddNew: false,
    dependentField: 'affiliateCode', // Producto depende del afiliado seleccionado
    dependentParamName: 'filter',
    errorMessage: 'Seleccione una práctica',
    additionalParams: {
      issuerId: null, // Inicialmente null
    },
  };

  taxConditionLookupConfigs: LookupConfig = {
    placeholder: 'Tipo de factura',
    url: `${environment.apiUrl}${endpoints.LOOKUP_TAX_CONDITIONS}`,
    showAddNew: false,
    errorMessage: 'Seleccione un tipo de factura',
  };

  periodLookupConfig: LookupConfig = {
    placeholder: 'Periodo',
    url: `${environment.apiUrl}${endpoints.LOOKUP_PERIOD}`,
    showAddNew: false,
    errorMessage: 'Seleccione un periodo',
    valueField: 'text',
  };

  onPeriodSelect($event: any) {
    console.log($event);
  }

  disableInput(event: KeyboardEvent): void {
    event.preventDefault();
  }

  printValueForm() {
    const invoiceData: HealthInvoice = this.getInvoiceDataFromForm();
    console.log(invoiceData);
  }

  onAffiliateChange($event: any) {
    this.affiliateName = $event?.text || '';
    console.log($event);
  }
}
