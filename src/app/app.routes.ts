import { Routes } from '@angular/router';
import { BoletasComponent } from './components/boletas/boletas.component';
import { BoletasListadoComponent } from './components/boletas-listado/boletas-listado.component';
import { AppLayout } from './components/layout/component/app.layout';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { ConfirmacionProveedorComponent } from './components/proveedores/confirmacion-proveedor.component';

export const routes: Routes = [

  { path: '', component: AppLayout, children: [
      { path: 'boletas', component: BoletasListadoComponent },
      { path: 'boletas/:id', component: BoletasComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'proveedores', component: ProveedoresComponent },
      { path: 'confirmacion-proveedor', component: ConfirmacionProveedorComponent },
    ]},
  { path: '**', redirectTo: 'boletas' }
];
