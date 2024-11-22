import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CUSTOM_DATE_ADAPTER_PROVIDERS } from './core/helpers/custom-date-adaptar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [CUSTOM_DATE_ADAPTER_PROVIDERS],  // Use the custom date adapter providers
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Arvent Cloud';
}
