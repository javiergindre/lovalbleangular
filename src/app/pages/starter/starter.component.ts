import { Component, ViewEncapsulation } from '@angular/core';
import { TopDocumentsService } from 'src/app/core/services/top-documents.service';
import { MaterialModule } from 'src/app/material.module';
import { TopDocument } from './models/top-documents-interfaces';
import { PaginatedResponse } from 'src/app/core/models/common/paginated-response';

@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  standalone: true,
  imports: [MaterialModule],
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent {
  topDocuments: TopDocument[] = [];
  currentPage = 1;
  pageSize = 10;
  isLoading: boolean = false;

  constructor(private topDocumentsService: TopDocumentsService) {}

  ngOnInit() {
    this.loadTopDocuments();
  }

  loadTopDocuments() {
    this.isLoading = true;
    this.topDocumentsService
      .getTopDocuments({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (response: PaginatedResponse<TopDocument>) => {
          this.topDocuments = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching top documents', error);
          this.isLoading = false;
        },
      });
  }

  // Top Documents Data
  // topDocumentsData: topDocuments[] = [
  //   {
  //     img: '/assets/images/svgs/icon-adobe.svg',  // Ensure the path is correct
  //     name: "Instructivo de facturación",
  //     fileUrl: ""
  //   },
  //   {
  //     img: '/assets/images/svgs/icon-adobe.svg',  // Ensure the path is correct
  //     name: "Nomenclador 2024-04",
  //     fileUrl: ""
  //   },
  //   {
  //     img: '/assets/images/svgs/icon-adobe.svg',  // Ensure the path is correct
  //     name: "Planilla de asistencia 2024",
  //     fileUrl: ""
  //   },
  //   {
  //     img: '/assets/images/svgs/icon-adobe.svg',  // Ensure the path is correct
  //     name: "Instructivo emisión factura por retroactivo",
  //     fileUrl: ""
  //   }
  // ];
}
