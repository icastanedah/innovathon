import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../services/notificaciones.service';
import { NotificacionIncidente, Incidente } from '../../interfaces/notificacion.interface';
import { Boleta } from '../../interfaces/boleta.interface';
import { Subscription } from 'rxjs';
import { BoletasService } from '../../services/boletas.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  endpointActivo = false;
  incidentes: Incidente[] = [];
  boletaCreada: Boleta | null = null;
  mensajeEstado = '';
  mostrarDetalles = false;
  errorMensaje = '';
  cargando = false;
  procesandoIncidente = false;

  private incidentesSubscription: Subscription | null = null;

  constructor(
    private notificacionesService: NotificacionesService,
    private router: Router,
    private boletasService: BoletasService
  ) { }

  ngOnInit(): void {
    // Inicializar mensaje de estado
    this.mensajeEstado = 'Monitoreo inactivo.';

    // Verificar si hay un estado guardado
    const estadoGuardado = localStorage.getItem('monitoreoActivo');
    if (estadoGuardado === 'true') {
      this.endpointActivo = true;
      this.mensajeEstado = 'Monitoreo activo. Esperando incidentes...';
      this.notificacionesService.iniciarConsultaPeriodica();
      this.suscribirseAIncidentes();
    }
  }

  ngOnDestroy(): void {
    // Cancelar suscripción al destruir el componente
    this.cancelarSuscripcion();
  }

  private suscribirseAIncidentes(): void {
    // Cancelar suscripción previa si existe
    this.cancelarSuscripcion();

    // Suscribirse a los incidentes
    this.cargando = true;
    this.incidentesSubscription = this.notificacionesService.incidentes$.subscribe({
      next: (incidentes: Incidente[]) => {
        this.incidentes = incidentes;
        this.cargando = false;
        this.mensajeEstado = `Monitoreo activo. ${incidentes.length} incidente(s) disponible(s).`;
        console.log('Incidentes obtenidos:', incidentes.length);
      },
      error: (error: any) => {
        console.error('Error al obtener incidentes:', error);
        this.errorMensaje = 'Error al conectar con el servidor. Verifique la conexión.';
        this.cargando = false;
        this.mensajeEstado = 'Error en el monitoreo.';
      }
    });
  }

  private cancelarSuscripcion(): void {
    if (this.incidentesSubscription) {
      this.incidentesSubscription.unsubscribe();
      this.incidentesSubscription = null;
      console.log('Suscripción a incidentes cancelada');
    }
  }

  toggleMonitoreo(): void {
    if (this.cargando) return;

    this.endpointActivo = !this.endpointActivo;

    // Guardar estado en localStorage
    localStorage.setItem('monitoreoActivo', this.endpointActivo.toString());

    if (this.endpointActivo) {
      // Activar monitoreo
      this.mensajeEstado = 'Monitoreo activo. Esperando incidentes...';
      this.errorMensaje = '';
      this.notificacionesService.iniciarConsultaPeriodica();
      this.suscribirseAIncidentes();
    } else {
      // Desactivar monitoreo
      this.mensajeEstado = 'Monitoreo inactivo.';
      this.notificacionesService.detenerConsultaPeriodica();
      this.cancelarSuscripcion();
      this.incidentes = [];
    }
  }

  procesarIncidente(index: number): void {
    if (index < 0 || index >= this.incidentes.length) {
      this.errorMensaje = 'Índice de incidente inválido';
      return;
    }

    const incidente = this.incidentes[index];
    if (!incidente || !incidente.incident_id) {
      this.errorMensaje = 'Incidente inválido o sin ID';
      return;
    }

    // Limpiar datos previos y establecer estado de procesamiento
    this.boletaCreada = null;
    this.mostrarDetalles = false;
    this.errorMensaje = '';
    this.procesandoIncidente = true;
    this.mensajeEstado = `Procesando incidente ${incidente.incident_id}...`;

    // Crear una copia profunda del incidente para evitar problemas de referencia
    const incidenteCopia = JSON.parse(JSON.stringify(incidente));
    console.log('Procesando incidente:', incidenteCopia);

    // Bloquear el scroll del body cuando se muestra el modal
    document.body.style.overflow = 'hidden';

    // Llamar al servicio para procesar el incidente
    this.notificacionesService.procesarIncidente(incidenteCopia).subscribe({
      next: (respuesta) => {
        console.log('Boleta creada con éxito en componente:', respuesta);

        if (!respuesta) {
          this.errorMensaje = 'Error: No se recibió respuesta del servicio';
          this.mensajeEstado = 'Error al procesar incidente.';
          this.procesandoIncidente = false;
          return;
        }

        // Guardar la boleta creada
        this.boletaCreada = respuesta;

        // Actualizar mensajes
        this.mensajeEstado = `Incidente ${incidente.incident_id} procesado correctamente. Boleta ${respuesta.numero} creada.`;
        this.mostrarDetalles = true;
        this.procesandoIncidente = false;

        // Bloquear el scroll del body cuando se muestra el modal
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Error al procesar incidente:', error);
        this.errorMensaje = `Error al procesar incidente: ${error.message || 'Error desconocido'}`;
        this.mensajeEstado = 'Error al procesar incidente.';
        this.procesandoIncidente = false;
      }
    });
  }

  /**
   * Limpia los datos y cierra el modal
   */
  limpiarDatos(): void {
    // Restaurar el scroll del body cuando se cierra el modal
    document.body.style.overflow = 'auto';

    // Limpiar datos
    this.boletaCreada = null;
    this.mostrarDetalles = false;
    this.mensajeEstado = this.endpointActivo ? 'Monitoreo activo. Esperando incidentes...' : 'Monitoreo inactivo.';

    console.log('Datos limpiados y modal cerrado');
  }

  buscarProveedores(index: number): void {
    if (index < 0 || index >= this.incidentes.length) {
      this.errorMensaje = 'Índice de incidente inválido';
      return;
    }

    const incidente = this.incidentes[index];
    if (!incidente || !incidente.incident_id) {
      this.errorMensaje = 'Incidente inválido o sin ID';
      return;
    }

    // Construir los parámetros para la búsqueda de proveedores
    const params = {
      incidentId: incidente.incident_id,
      location: `${incidente.location.latitude},${incidente.location.longitude}`,
      serviceType: incidente.incident_info.damage_type,
      address: encodeURIComponent(incidente.location.address)
    };

    // Construir la URL con los parámetros
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value as string);
    });

    // Navegar a la pantalla de búsqueda de proveedores con los parámetros
    this.router.navigate(['/proveedores'], {
      queryParams: params
    });

    console.log('Navegando a búsqueda de proveedores con parámetros:', params);
  }
}
