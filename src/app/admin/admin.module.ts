import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeComponent } from './back-office/back-office.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [BackOfficeComponent],
  imports: [CommonModule, RouterModule.forRoot([{ path: 'bo', component: BackOfficeComponent }])]
})
export class AdminModule {}
