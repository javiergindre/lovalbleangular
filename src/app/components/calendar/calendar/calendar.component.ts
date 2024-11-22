import { Component, OnInit } from '@angular/core';
import { AppFullcalendarComponent } from '../fullcalendar/fullcalendar.component';
import { EntityType } from 'src/app/core/models/entityType/entityType';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [AppFullcalendarComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  entityType: EntityType;
  entityId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      const entityTypeParam = params.get('entityType');
      const entityIdParam = params.get('entityId');
      // Asignar los valores a las propiedades, asegurándose de convertirlos a los tipos correctos
      if (entityTypeParam) {
        this.entityType = Number(entityTypeParam); // Convierte a número
      }

      if (entityIdParam) {
        this.entityId = Number(entityIdParam); // Convierte a número
      }
    });

  }
}
