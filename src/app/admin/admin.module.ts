import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeComponent } from './back-office/back-office.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [BackOfficeComponent],
  imports: [CommonModule, AdminRoutingModule]
})
export class AdminModule {}
