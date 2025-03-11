import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../services/notificaciones.service';
import { NotificacionIncidente, Incidente } from '../../interfaces/notificacion.interface';
import { Boleta } from '../../interfaces/boleta.interface';
import { Subscription } from 'rxjs';
import { BoletasService } from '../../services/boletas.service';
import { ProveedoresService, RespuestaProveedores, ProveedorCercano } from '../../services/proveedores.service';
import { ProveedoresResponse, Proveedor } from '../../interfaces/proveedor.interface';

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
  buscandoProveedor = false;
  proveedorEncontrado: ProveedoresResponse | null = null;
  proveedorSeleccionado: Proveedor | null = null;
  respuestaOriginalAPI: any = null;
  mostrarDepuracion = true;
  incidenteTemporal: Incidente | null = null;

  private incidentesSubscription: Subscription | null = null;

  constructor(
    private notificacionesService: NotificacionesService,
    private router: Router,
    private boletasService: BoletasService,
    private proveedoresService: ProveedoresService
  ) { }

  ngOnInit(): void {
    // Verificar la disponibilidad de la API
    this.verificarDisponibilidadAPI();

    // Inicializar el mensaje de estado
    this.mensajeEstado = 'Monitoreo de incidentes desactivado';

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
    this.proveedorEncontrado = null;

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
   * Busca el proveedor más cercano para la boleta creada
   * @param incidente Incidente procesado
   * @param boleta Boleta creada
   */
  private buscarProveedorParaBoleta(incidente: Incidente, boleta: Boleta): void {
    if (!incidente || !incidente.location || !boleta) {
      console.error('Datos insuficientes para buscar proveedor');
      return;
    }

    this.buscandoProveedor = true;
    this.errorMensaje = '';
    this.respuestaOriginalAPI = null; // Limpiar respuesta anterior

    // Obtener el tipo de servicio requerido
    const tipoServicio = boleta.servicios && boleta.servicios.length > 0
      ? this.proveedoresService.mapearTipoServicio(boleta.servicios[0].tipo)
      : 'grua'; // Valor por defecto

    // Construir la información del vehículo
    const infoVehiculo = `${boleta.vehiculo.marca} ${boleta.vehiculo.linea} ${boleta.vehiculo.modelo}`;

    // Buscar el proveedor más cercano
    this.proveedoresService.buscarProveedorMasCercano(
      incidente.location.address,
      tipoServicio,
      infoVehiculo,
      incidente.location.latitude,
      incidente.location.longitude
    ).subscribe({
      next: (resultado) => {
        console.log('Resultado de búsqueda de proveedores:', resultado);

        // Guardar la respuesta original para depuración
        this.respuestaOriginalAPI = this.proveedoresService.getLastResponse();

        if (resultado === null) {
          console.log('No se encontraron proveedores disponibles');
          this.errorMensaje = 'No se encontraron proveedores disponibles para este incidente.';
          this.buscandoProveedor = false;
          return;
        }

        this.proveedorEncontrado = resultado;

        // Seleccionar el primer proveedor de la lista (el más cercano)
        if (resultado.providerList && resultado.providerList.length > 0) {
          this.proveedorSeleccionado = resultado.providerList[0];
          // Actualizar la boleta con la información del proveedor
          this.actualizarBoletaConProveedor(boleta, this.proveedorSeleccionado);
        }

        this.buscandoProveedor = false;
      },
      error: (error) => {
        console.error('Error al buscar proveedor más cercano:', error);
        this.errorMensaje = `Error al buscar proveedores: ${error.message || 'Error desconocido'}`;
        this.buscandoProveedor = false;
      }
    });
  }

  /**
   * Actualiza la boleta con la información del proveedor encontrado
   * @param boleta Boleta a actualizar
   * @param proveedor Proveedor seleccionado
   */
  private actualizarBoletaConProveedor(boleta: Boleta, proveedor: Proveedor): void {
    if (!boleta || !proveedor) return;

    // Crear una copia de la boleta para actualizar
    const boletaActualizada: Partial<Boleta> = {
      proveedor: {
        nombre: proveedor.proveedorName,
        telefonos: [proveedor.phoneNumber],
        tipo: boleta.servicios && boleta.servicios.length > 0 ? boleta.servicios[0].tipo : 'Desconocido',
        base: proveedor.direccion
      }
    };

    // Actualizar la boleta en el servicio
    this.boletasService.actualizarBoleta(boleta.id, boletaActualizada).subscribe({
      next: (boletaActualizada) => {
        console.log('Boleta actualizada con información del proveedor:', boletaActualizada);
        // Actualizar la boleta mostrada
        this.boletaCreada = boletaActualizada;
      },
      error: (error) => {
        console.error('Error al actualizar boleta con proveedor:', error);
      }
    });
  }

  /**
   * Selecciona un proveedor y actualiza la boleta
   */
  seleccionarProveedor(proveedor: Proveedor): void {
    this.proveedorSeleccionado = proveedor;

    if (this.boletaCreada) {
      // Actualizar la boleta con la información del proveedor
      this.actualizarBoletaConProveedor(this.boletaCreada, proveedor);

      // Mostrar mensaje de confirmación
      alert(`Proveedor "${proveedor.proveedorName}" seleccionado correctamente. Tiempo estimado: ${proveedor.time}, Distancia: ${proveedor.distance}`);

      // Cerrar el modal después de seleccionar
      this.limpiarDatos();
    }
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
    this.proveedorEncontrado = null;
    this.proveedorSeleccionado = null;
    this.buscandoProveedor = false;
    this.mensajeEstado = this.endpointActivo ? 'Monitoreo activo. Esperando incidentes...' : 'Monitoreo inactivo.';

    console.log('Datos limpiados y modal cerrado');
  }

  buscarProveedores(index: number): void {
    if (index < 0 || index >= this.incidentes.length) {
      console.error('Índice de incidente inválido');
      return;
    }

    const incidente = this.incidentes[index];
    this.buscandoProveedor = true;
    this.errorMensaje = '';

    // Limpiar datos previos
    this.proveedorEncontrado = null;
    this.proveedorSeleccionado = null;

    // Crear una boleta temporal para la búsqueda
    const boletaTemporal: any = {
      id: 'temp-' + Date.now(),
      numero: 'TEMP-' + Date.now(),
      fecha: new Date(),
      estado: 'Pendiente',
      tipo: 'Asistencia',
      vehiculo: {
        marca: incidente.vehicle_info.make,
        linea: incidente.vehicle_info.model,
        modelo: incidente.vehicle_info.year.toString(),
        color: incidente.vehicle_info.color,
        placa: incidente.vehicle_info.plate,
        tipo: 'Automóvil' // Valor por defecto ya que VehiculoInfo no tiene la propiedad 'type'
      },
      servicios: [
        {
          id: 'temp-serv-' + Date.now(),
          tipo: this.mapearTipoServicio(incidente.incident_info.damage_type),
          estado: 'Pendiente',
          fechaAsignacion: new Date()
        }
      ],
      direccion: {
        ubicacion: incidente.location.address,
        latitud: incidente.location.latitude,
        longitud: incidente.location.longitude
      }
    };

    // Buscar proveedores directamente
    const tipoServicio = this.mapearTipoServicio(incidente.incident_info.damage_type);
    const infoVehiculo = `${incidente.vehicle_info.make} ${incidente.vehicle_info.model} ${incidente.vehicle_info.year}`;

    this.proveedoresService.buscarProveedorMasCercano(
      incidente.location.address,
      tipoServicio,
      infoVehiculo,
      incidente.location.latitude,
      incidente.location.longitude
    ).subscribe({
      next: (resultado) => {
        console.log('Resultado de búsqueda de proveedores:', resultado);

        if (resultado === null) {
          this.errorMensaje = 'No se encontraron proveedores disponibles para este incidente.';
        } else {
          this.proveedorEncontrado = resultado;
        }

        this.buscandoProveedor = false;

        // Mostrar el modal
        this.boletaCreada = boletaTemporal;
        this.mostrarDetalles = true;
      },
      error: (error) => {
        console.error('Error al buscar proveedores:', error);
        this.errorMensaje = `Error al buscar proveedores: ${error.message || 'Error desconocido'}`;
        this.buscandoProveedor = false;

        // Mostrar el modal incluso con error
        this.boletaCreada = boletaTemporal;
        this.mostrarDetalles = true;
      }
    });
  }

  /**
   * Mapea el tipo de incidente a un tipo de servicio
   */
  private mapearTipoServicio(tipoIncidente: string): string {
    switch (tipoIncidente.toLowerCase()) {
      case 'flat tire':
        return 'Cambio de llanta';
      case 'battery':
        return 'Batería';
      case 'fuel':
        return 'Combustible';
      case 'tow':
        return 'Grúa';
      default:
        return 'Asistencia';
    }
  }

  /**
   * Verifica la disponibilidad de la API de proveedores
   */
  private verificarDisponibilidadAPI(): void {
    this.proveedoresService.verificarAPI().subscribe({
      next: (disponible) => {
        if (disponible) {
          console.log('La API de proveedores está disponible');
        } else {
          console.warn('La API de proveedores no está disponible');
          this.errorMensaje = 'No se pudo conectar con el servicio de proveedores. Algunas funcionalidades pueden no estar disponibles.';
        }
      },
      error: (error) => {
        console.error('Error al verificar la API de proveedores:', error);
        this.errorMensaje = 'Error al verificar el servicio de proveedores. Algunas funcionalidades pueden no estar disponibles.';
      }
    });
  }

  /**
   * Procesa la boleta actual
   * Este método procesa un incidente existente y crea una boleta
   */
  procesarBoletaActual(): void {
    console.log('Procesando boleta actual...');

    // Verificar si hay incidentes disponibles
    if (this.incidentes.length === 0) {
      this.errorMensaje = 'No hay incidentes disponibles para procesar. Active el monitoreo para recibir incidentes.';
      return;
    }

    // Procesar el primer incidente de la lista
    this.procesarIncidente(0);
  }

  /**
   * Busca proveedores para la boleta actual que se muestra en el modal
   */
  buscarProveedoresParaBoletaActual(): void {
    console.log('Buscando proveedores para la boleta actual...');

    if (!this.boletaCreada) {
      this.errorMensaje = 'No hay una boleta creada para buscar proveedores.';
      return;
    }

    this.buscandoProveedor = true;
    this.errorMensaje = '';

    // Limpiar datos previos
    this.proveedorEncontrado = null;
    this.proveedorSeleccionado = null;

    // Obtener información de la boleta
    const tipoServicio = this.boletaCreada.servicios && this.boletaCreada.servicios.length > 0
      ? this.proveedoresService.mapearTipoServicio(this.boletaCreada.servicios[0].tipo)
      : 'grua'; // Valor por defecto

    const infoVehiculo = `${this.boletaCreada.vehiculo.marca} ${this.boletaCreada.vehiculo.linea} ${this.boletaCreada.vehiculo.modelo}`;

    // Usar coordenadas por defecto ya que DireccionSiniestro no tiene latitud/longitud
    const latitud = 14.6349; // Coordenadas por defecto (Ciudad de Guatemala)
    const longitud = -90.5069;

    // Buscar proveedores
    this.proveedoresService.buscarProveedorMasCercano(
      this.boletaCreada.direccion.ubicacion,
      tipoServicio,
      infoVehiculo,
      latitud,
      longitud
    ).subscribe({
      next: (resultado) => {
        console.log('Resultado de búsqueda de proveedores:', resultado);

        if (resultado === null) {
          this.errorMensaje = 'No se encontraron proveedores disponibles para esta boleta.';
        } else {
          this.proveedorEncontrado = resultado;

          // Seleccionar el primer proveedor de la lista (el más cercano)
          if (resultado.providerList && resultado.providerList.length > 0) {
            this.proveedorSeleccionado = resultado.providerList[0];
            // Actualizar la boleta con la información del proveedor
            if (this.boletaCreada) {
              this.actualizarBoletaConProveedor(this.boletaCreada, this.proveedorSeleccionado);
            }
          }
        }

        this.buscandoProveedor = false;
      },
      error: (error) => {
        console.error('Error al buscar proveedores:', error);
        this.errorMensaje = `Error al buscar proveedores: ${error.message || 'Error desconocido'}`;
        this.buscandoProveedor = false;
      }
    });
  }

  /**
   * Navega a la pantalla de edición de la boleta creada
   */
  irAListaBoletas(): void {
    console.log('Navegando a la edición de la boleta...');

    if (!this.boletaCreada) {
      console.error('No hay una boleta creada para editar');
      return;
    }

    // Guardar el ID de la boleta para usarlo en la navegación
    const boletaId = this.boletaCreada.id;

    // Cerrar el modal
    this.limpiarDatos();

    // Navegar a la pantalla de edición de la boleta
    this.router.navigate(['/boletas', boletaId]);
  }
}
