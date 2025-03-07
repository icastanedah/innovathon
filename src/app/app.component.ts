import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [RouterModule, ButtonModule, ToastModule],
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent {
  title = 'bulk-insurance-policy-web';

  constructor() {}


}
