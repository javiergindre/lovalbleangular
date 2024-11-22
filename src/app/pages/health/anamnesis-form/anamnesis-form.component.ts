import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';
import { DynamicForm } from 'src/app/components/dynamic-form/models';
import { AnamnesisService } from 'src/app/core/services/anamnesis.service';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-anamnesis-form',
  standalone: true,
  imports: [DynamicFormComponent, MaterialModule],
  templateUrl: './anamnesis-form.component.html',
  styleUrl: './anamnesis-form.component.scss',
})
export class AnamnesisFormComponent {
  config$!: Observable<DynamicForm>;
  isLoading = true; // Estado inicial en true
  code: number;

  constructor(
    private anamnesisService: AnamnesisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.code = params['id'];
        this.config$ = this.anamnesisService.getAnamnesis(this.code);

        this.isLoading = false;
      }
    });
  }

  downloadReport() {
    console.log(this.code);

    this.anamnesisService.downloadReport(this.code).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'report.pdf'; // Cambiar el nombre según sea necesario
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (error) => {
        console.error('Download error', error);
      },
    });
  }
}
