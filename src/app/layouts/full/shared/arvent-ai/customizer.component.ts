import {
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { AppSettings } from 'src/app/config';
import { CoreService } from 'src/app/core/services/core.service';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-arvent-ai',
  standalone: true,
  imports: [
    BrandingComponent,
    TablerIconsModule,
    MaterialModule,
    FormsModule,
    NgScrollbarModule,
    NgIf,
  ],
  templateUrl: './arvent-ai.component.html',
  styleUrls: ['./arvent-ai.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArventAiComponent {
  @Output() optionsChange = new EventEmitter<AppSettings>();
  hideSingleSelectionIndicator = signal(true);
  hideMultipleSelectionIndicator = signal(true);
  constructor(private settings: CoreService) { }
  options = this.settings.getOptions();

}
