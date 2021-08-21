import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddButtonComponent } from 'app/add-button/add-button.component';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { AdminGuard } from './admin.guard';
import { BackOfficeComponent } from './back-office/back-office.component';

const routes: Routes = [
  {
    path: 'bo',
    canActivate: [AdminGuard],
    component: BackOfficeComponent,
    children: [
      { path: 'one', component: AddButtonComponent },
      { path: 'two', component: NavbarComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
