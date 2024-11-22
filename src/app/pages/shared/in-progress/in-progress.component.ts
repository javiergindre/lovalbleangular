import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-in-progress',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './in-progress.component.html',
})
export class AppInProgressComponent { }
