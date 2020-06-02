import { Component } from '@angular/core';

@Component({
  selector: 'app-update-notification',
  templateUrl: './update-notification.component.html',
  styleUrls: ['./update-notification.component.scss']
})
export class UpdateNotificationComponent {
  public refresh(): void {
    window.location.reload();
  }
}
