import { Component, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {EstadoBoleta, TipoBoleta} from '../../../interfaces/boleta.interface';
import {BoletaFilterService} from '../../../services/table-filter.service';
import {SelectModule} from 'primeng/select';
import {DatePicker, DatePickerModule} from 'primeng/datepicker';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    SelectModule,
    DatePicker,
  ],
  template: `<div class="layout-sidebar bg-gray-100 p-4 w-80">
    <div class="p-4 rounded-md ">
      <div class="font-semibold text-lg mb-4">Filters</div>
      <div class="grid grid-cols-1 gap-y-7">
        <div class="col-span-1">
          <label for="numero" class="block text-sm font-medium text-gray-700">Número</label>
          <input id="numero" type="text" pInputText [(ngModel)]="filter.numero" class="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div class="col-span-1">
          <label for="titular" class="block text-sm font-medium text-gray-700">Titular</label>
          <input id="titular" type="text" pInputText [(ngModel)]="filter.titular" class="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div class="col-span-1">
          <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha</label>
          <p-datePicker id="fecha" [(ngModel)]="filter.fecha" dateFormat="dd/mm/yy" class="w-full mt-1"></p-datePicker>
        </div>
        <div class="col-span-1">
          <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
          <p-select id="estado" [options]="estados" [(ngModel)]="filter.estado" placeholder="Select State" class="w-full mt-1"></p-select>
        </div>
        <div class="col-span-1">
          <label for="tipo" class="block text-sm font-medium text-gray-700">Tipo</label>
          <p-select id="tipo" [options]="tipos" [(ngModel)]="filter.tipo" placeholder="Select Type" class="w-full mt-1"></p-select>
        </div>
      </div>
      <div class="flex justify-between mt-6">
        <button pButton type="button" label="Clear" class="p-button-secondary" (click)="clearFilter()"></button>
        <button pButton type="button" label="Filter" class="p-button-primary" (click)="applyFilter()"></button>
      </div>
    </div>
  </div>`,
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebar {
  filter: any = {
    numero: null,
    titular: null,
    fecha: null,
    estado: null,
    tipo: null,
  };

  estados = Object.values(EstadoBoleta);
  tipos = Object.values(TipoBoleta);

  constructor(private boletaFilterService: BoletaFilterService) {}

  applyFilter() {
    this.boletaFilterService.setFilter(this.filter);
  }

  clearFilter() {
    this.filter = {
      numero: null,
      titular: null,
      fecha: null,
      estado: null,
      tipo: null,
    };
    this.boletaFilterService.setFilter(this.filter);
  }
}
