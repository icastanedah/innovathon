import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BoletasService } from '../../services/boletas.service';
import { BoletaFiltros, BoletaListado, Boleta } from '../../interfaces/boleta.interface';

@Component({
  selector: 'app-boletas-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './boletas-listado.component.html',
  styleUrls: ['./boletas-listado.component.css']
})
export class BoletasListadoComponent implements OnInit {
  tipoBusqueda: 'general' | 'numero' = 'general';
  numeroBoleta: string = '';
  mostrarBusquedaNumero: boolean = false;
  
  filtros: BoletaFiltros = {
    fechaInicio: new Date(),
    fechaFin: new Date()
  };
  
  boletas: BoletaListado[] = [];
  cargando = false;
  error: string | null = null;

  // Opciones para los selectores
  operadores: string[] = ['Operador 1', 'Operador 2', 'Operador 3'];
  estados: string[] = ['Activo', 'Pendiente', 'Completado', 'Cancelado'];
  tiposSiniestro: string[] = ['Asistencia', 'Robo', 'Accidente'];
  servicios: string[] = ['Grúa', 'Mecánico', 'Cerrajero'];
  origenesBoleta: string[] = ['CAB', 'Web', 'App'];
  despachadores: string[] = ['Despachador 1', 'Despachador 2', 'Despachador 3'];

  constructor(
    private boletasService: BoletasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscarBoletas();
  }

  cambiarTipoBusqueda(tipo: 'general' | 'numero'): void {
    console.log('Cambiando tipo de búsqueda a:', tipo);
    this.tipoBusqueda = tipo;
    this.mostrarBusquedaNumero = tipo === 'numero';
    this.error = null;
    this.boletas = [];
    this.numeroBoleta = '';
  }

  buscarBoletas(): void {
    console.log('Buscando boletas. Tipo:', this.tipoBusqueda);
    if (this.tipoBusqueda === 'numero' && !this.numeroBoleta.trim()) {
      this.error = 'Ingrese un número de boleta';
      return;
    }

    this.cargando = true;
    this.error = null;

    if (this.tipoBusqueda === 'numero') {
      // Buscar por número y mostrar en la tabla
      this.boletasService.getBoletas()
        .subscribe({
          next: (boletas) => {
            const boletasFiltradas = boletas.filter(b => 
              b.numero.toLowerCase().includes(this.numeroBoleta.toLowerCase().trim())
            );

            if (boletasFiltradas.length === 0) {
              this.error = 'No se encontraron boletas con ese número';
              this.boletas = [];
            } else {
              this.boletas = boletasFiltradas.map(b => ({
                id: b.id,
                numero: b.numero,
                piloto: b.siniestro.nombrePiloto,
                reportante: b.siniestro.nombreReportante,
                poliza: b.asegurado.numeroPoliza,
                direccion: b.direccion.ubicacion,
                estado: b.estado,
                tipoSiniestro: b.siniestro.tipo,
                origen: b.tipo,
                tipoBoleta: b.tipo
              }));
            }
            this.cargando = false;
          },
          error: (error) => {
            this.cargando = false;
            this.error = 'Error al buscar las boletas';
          }
        });
    } else {
      // Búsqueda general con filtros
      this.boletasService.getBoletas()
        .subscribe({
          next: (boletas) => {
            this.boletas = boletas.map(b => ({
              id: b.id,
              numero: b.numero,
              piloto: b.siniestro.nombrePiloto,
              reportante: b.siniestro.nombreReportante,
              poliza: b.asegurado.numeroPoliza,
              direccion: b.direccion.ubicacion,
              estado: b.estado,
              tipoSiniestro: b.siniestro.tipo,
              origen: b.tipo,
              tipoBoleta: b.tipo
            }));
            this.cargando = false;
          },
          error: (error) => {
            this.cargando = false;
            this.error = 'Error al cargar las boletas';
          }
        });
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: new Date(),
      fechaFin: new Date()
    };
    this.numeroBoleta = '';
    this.boletas = [];
    this.error = null;
  }

  onBuscarClick(): void {
    console.log('Click en buscar. Tipo:', this.tipoBusqueda, 'Número:', this.numeroBoleta);
    this.buscarBoletas();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/boletas', id]);
  }
} 