import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { messages } from './chat-data';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SkinService } from 'src/app/core/services/skin.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class AppChatComponent {
  // Public and private properties
  public skinDev: boolean = false;
  sidePanelOpened = true;
  msg = '';
  selectedMessage: any;
  public messages: Array<any> = messages;
  private skinService = inject(SkinService);

  // ViewChild
  @ViewChild('myInput', { static: true }) myInput: ElementRef = Object.create(null);

  constructor() {
    this.selectedMessage = this.messages[0];

    this.skinService.skinDev$.subscribe(skinDev => {
      this.skinDev = skinDev;
    });
  }

  // Methods
  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  onSelect(message: Object[]): void {
    this.selectedMessage = message;
  }

  OnAddMsg(): void {
    this.msg = this.myInput.nativeElement.value;

    if (this.msg !== '') {
      this.selectedMessage.chat.push({
        type: 'even',
        msg: this.msg,
        date: new Date(),
      });
    }

    this.myInput.nativeElement.value = '';
  }
}
