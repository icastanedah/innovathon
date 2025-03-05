import { Routes } from '@angular/router';
import { BoletasComponent } from './components/boletas/boletas.component';
import { BoletasListadoComponent } from './components/boletas-listado/boletas-listado.component';

export const routes: Routes = [
  { path: 'boletas', component: BoletasListadoComponent },
  { path: 'boletas/:id', component: BoletasComponent },
  { path: '', redirectTo: 'boletas', pathMatch: 'full' },
  { path: '**', redirectTo: 'boletas' }
];
