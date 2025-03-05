import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoletasService } from '../../services/boletas.service';
import { Boleta, EstadoBoleta, TiemposBoleta, CostosBoleta } from '../../interfaces/boleta.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boletas.component.html',
  styleUrls: ['./boletas.component.css']
})
export class BoletasComponent implements OnInit {
  // Hacer EstadoBoleta disponible en el template
  EstadoBoleta = EstadoBoleta;
  
  boleta: Boleta | null = null;
  boletaOriginal: Boleta | null = null;
  cargando = false;
  error: string | null = null;
  modoEdicion = false;
  guardando = false;

  // Usuario actual
  usuario: string = 'Ituy';

  // Propiedades para tiempos
  tiempos: TiemposBoleta = {
    horaDespacho: new Date(),
    tiempoDespacho: '0 Días, 00:00:00',
    tiempoLlegada: '0 Días, 00:00:00',
    tiempoAtencion: '0 Días, 00:00:00'
  };

  // Propiedades para costos
  costos: CostosBoleta = {
    servicio: 'Grúa',
    unidades: 1,
    kmTerracerias: 0,
    kmRecorrido: 0,
    kmVacio: 0,
    costoManiobra: 0,
    costoEspera: 0,
    tarifaBase: 150,
    tarifaKmTerracerias: 10,
    tarifaKmRecorrido: 10,
    tarifaKmVacio: 5
  };

  // Propiedades para datos del servicio
  piloto: string = '';
  telefono: string = '';
  tiempoEstimado: string = '';

  // Propiedades para localización
  pais: string = 'GUATEMALA';
  departamento: string = 'GUATEMALA';
  municipio: string = 'GUATEMALA';
  zona: string = '';
  colonia: string = '';
  calleAv: string = '';
  numero: string = '';
  edificio: string = '';
  apartamento: string = '';
  referencias: string = '';

  constructor(
    private boletasService: BoletasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cargarBoleta(Number(params['id']));
      }
    });
  }

  cargarBoleta(id: number): void {
    this.cargando = true;
    this.error = null;
    
    this.boletasService.getBoleta(id)
      .pipe(
        catchError(error => {
          console.error('Error al cargar la boleta:', error);
          this.error = error.message || 'Error al cargar la boleta';
          return of(null);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe(boleta => {
        if (boleta) {
          this.boleta = JSON.parse(JSON.stringify(boleta));
          this.boletaOriginal = JSON.parse(JSON.stringify(boleta));
          this.inicializarDatos();
        }
      });
  }

  inicializarDatos(): void {
    if (this.boleta) {
      // Inicializar tiempos
      if (this.boleta.tiempos) {
        this.tiempos = { ...this.boleta.tiempos };
      }

      // Inicializar costos
      if (this.boleta.costos) {
        this.costos = { ...this.boleta.costos };
      }

      // Inicializar datos del servicio
      this.piloto = this.boleta.siniestro.nombrePiloto || '';
      this.telefono = this.boleta.telefonos[0] || '';
      
      // Inicializar datos de localización
      if (this.boleta.direccion) {
        this.zona = this.boleta.direccion.zona || '';
        this.calleAv = this.boleta.direccion.calleAvenida || '';
        this.referencias = this.boleta.direccion.referencia || '';
      }
    }
  }

  calcularSubtotal(): number {
    return this.costos.tarifaBase +
           (this.costos.kmTerracerias * this.costos.tarifaKmTerracerias) +
           (this.costos.kmRecorrido * this.costos.tarifaKmRecorrido) +
           (this.costos.kmVacio * this.costos.tarifaKmVacio) +
           this.costos.costoManiobra +
           this.costos.costoEspera;
  }

  onEditarClick(): void {
    this.modoEdicion = true;
  }

  onGuardarClick(): void {
    if (!this.boleta) return;

    this.actualizarDatosBoleta();

    this.guardando = true;
    this.error = null;

    this.boletasService.actualizarBoleta(this.boleta.id, this.boleta)
      .pipe(
        catchError(error => {
          console.error('Error al guardar la boleta:', error);
          this.error = error.message || 'Error al guardar los cambios';
          return of(null);
        }),
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe(boletaActualizada => {
        if (boletaActualizada) {
          this.boleta = JSON.parse(JSON.stringify(boletaActualizada));
          this.boletaOriginal = JSON.parse(JSON.stringify(boletaActualizada));
          this.modoEdicion = false;
        }
      });
  }

  actualizarDatosBoleta(): void {
    if (!this.boleta) return;

    // Actualizar tiempos
    this.boleta.tiempos = { ...this.tiempos };

    // Actualizar costos
    this.boleta.costos = { ...this.costos };

    // Actualizar datos del servicio
    this.boleta.siniestro.nombrePiloto = this.piloto;
    this.boleta.telefonos = [this.telefono];

    // Actualizar datos de localización
    if (this.boleta.direccion) {
      this.boleta.direccion.zona = this.zona;
      this.boleta.direccion.calleAvenida = this.calleAv;
      this.boleta.direccion.referencia = this.referencias;
    }
  }

  onCancelarEdicionClick(): void {
    if (this.boletaOriginal) {
      this.boleta = JSON.parse(JSON.stringify(this.boletaOriginal));
      this.inicializarDatos();
    }
    this.modoEdicion = false;
    this.error = null;
  }

  onRegresarClick(): void {
    this.router.navigate(['/boletas']);
  }

  onImprimirClick(): void {
    console.log('Imprimir boleta:', this.boleta?.id);
  }

  onCancelarBoletaClick(): void {
    if (!this.boleta) return;

    this.cargando = true;
    this.error = null;

    this.boletasService.actualizarEstado(this.boleta.id, EstadoBoleta.CANCELADO)
      .pipe(
        catchError(error => {
          console.error('Error al cancelar la boleta:', error);
          this.error = error.message || 'Error al cancelar la boleta';
          return of(null);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe(boletaActualizada => {
        if (boletaActualizada) {
          this.boleta = boletaActualizada;
          this.boletaOriginal = JSON.parse(JSON.stringify(boletaActualizada));
        }
      });
  }

  onCambiarProveedorClick(): void {
    console.log('Cambiar proveedor');
  }

  onIndicarLlegadaClick(): void {
    if (this.boleta && this.boleta.tiempos) {
      this.boleta.tiempos.horaLlegada = new Date();
      this.tiempos.horaLlegada = new Date();
      this.actualizarTiempos();
    }
  }

  actualizarTiempos(): void {
    if (!this.tiempos.horaDespacho) return;

    // Calcular tiempo de despacho
    const ahora = new Date();
    const tiempoDespachoMs = ahora.getTime() - this.tiempos.horaDespacho.getTime();
    this.tiempos.tiempoDespacho = this.formatearTiempo(tiempoDespachoMs);

    // Calcular tiempo de llegada si existe
    if (this.tiempos.horaLlegada) {
      const tiempoLlegadaMs = this.tiempos.horaLlegada.getTime() - this.tiempos.horaDespacho.getTime();
      this.tiempos.tiempoLlegada = this.formatearTiempo(tiempoLlegadaMs);
    }

    // Calcular tiempo de atención si existe hora de finalización
    if (this.tiempos.horaFinalizacion && this.tiempos.horaLlegada) {
      const tiempoAtencionMs = this.tiempos.horaFinalizacion.getTime() - this.tiempos.horaLlegada.getTime();
      this.tiempos.tiempoAtencion = this.formatearTiempo(tiempoAtencionMs);
    }
  }

  formatearTiempo(ms: number): string {
    const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
    const horas = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((ms % (1000 * 60)) / 1000);

    return `${dias} Días, ${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  esEditable(campo: string): boolean {
    return this.modoEdicion && !this.cargando && !this.guardando;
  }
}
