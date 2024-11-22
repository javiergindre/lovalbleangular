import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent {}
