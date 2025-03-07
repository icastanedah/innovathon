import { Routes } from '@angular/router';
import { BoletasComponent } from './components/boletas/boletas.component';
import { BoletasListadoComponent } from './components/boletas-listado/boletas-listado.component';
import {AppLayout} from './components/layout/component/app.layout';

export const routes: Routes = [

  { path: '',component:AppLayout,children:[
      { path: 'boletas', component: BoletasListadoComponent },
      { path: 'boletas/:id', component: BoletasComponent },
    ]},
  { path: '**', redirectTo: 'boletas' }
];
