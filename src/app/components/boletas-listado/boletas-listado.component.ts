import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { RippleModule } from 'primeng/ripple';
import { Boleta, EstadoBoleta } from '../../interfaces/boleta.interface';
import { BoletaFilterService } from '../../services/table-filter.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BoletasComponent } from '../boletas/boletas.component';
import { Subscription } from 'rxjs';
import Boletas from './boletas.json';
@Component({
  selector: 'app-boletas-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    AccordionModule,
    RippleModule,
  ],
  templateUrl: './boletas-listado.component.html',
  styleUrls: ['./boletas-listado.component.scss'],
  providers: [DialogService],
})
export class BoletasListadoComponent implements OnInit, OnDestroy {
  boletas: Boleta[] = [];
  filteredBoletas: Boleta[] = [];
  loading: boolean = true;
  filterSubscription: Subscription | undefined;
  ref: DynamicDialogRef | undefined;
  expandedRows: { [key: string]: boolean } = {};

  constructor(
    private boletaFilterService: BoletaFilterService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.boletas = Boletas as unknown as Boleta[];
      this.filteredBoletas = [...this.boletas];
      this.loading = false;
    }, 500);

    this.filterSubscription = this.boletaFilterService.filter$.subscribe((filter) => {
      this.applyFilter(filter);
    });
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    if (this.ref) {
      this.ref.close();
    }
  }

  applyFilter(filter: any) {
    if (!this.boletas || this.boletas.length === 0) return;

    this.filteredBoletas = this.boletas.filter((boleta) => {
      let match = true;

      if (filter.numero && !boleta.numero.toString().includes(filter.numero)) {
        match = false;
      }
      if (filter.titular && !boleta.asegurado.titular.toLowerCase().includes(filter.titular.toLowerCase())) {
        match = false;
      }
      if (filter.fecha) {
        const boletaDate = new Date(boleta.fecha);
        const filterDate = new Date(filter.fecha);
        if (boletaDate.toDateString() !== filterDate.toDateString()) {
          match = false;
        }
      }
      if (filter.estado && boleta.estado !== filter.estado) {
        match = false;
      }
      if (filter.tipo && boleta.tipo !== filter.tipo) {
        match = false;
      }

      return match;
    });
  }

  getSeverity(estado: EstadoBoleta) {
    switch (estado) {
      case EstadoBoleta.ACTIVO:
        return 'success';
      case EstadoBoleta.PENDIENTE:
        return 'warn';
      case EstadoBoleta.CANCELADO:
        return 'danger';
      case EstadoBoleta.COMPLETADO:
        return 'info';
      default:
        return 'info';
    }
  }

  openBoletasModal(boleta: Boleta) {
    this.ref = this.dialogService.open(BoletasComponent, {
      data: {
        boleta: boleta,
      },
      width: '70vw',
      height: '70vh',
      modal: true,
      maximizable: true,
      closable: true,
    });
  }

  toggleRow(boleta: Boleta) {
    if (this.isRowExpanded(boleta)) {
      delete this.expandedRows[boleta.id];
    } else {
      this.expandedRows[boleta.id] = true;
    }
  }

  isRowExpanded(boleta: Boleta): boolean {
    return this.expandedRows[boleta.id] === true;
  }
}
