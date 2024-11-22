import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './forbidden.component.html',
})
export class ForbiddenComponent {}
