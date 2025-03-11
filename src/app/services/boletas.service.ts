import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Boleta, EstadoBoleta, TipoBoleta } from '../interfaces/boleta.interface';
import { NotificacionIncidente } from '../interfaces/notificacion.interface';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoletasService {
  private apiUrl = 'tu-api-url/boletas';

  // Datos simulados
  private boletasSimuladas: Boleta[] = [
    {
      id: 1,
      numero: 'BOL-001',
      fecha: new Date(),
      estado: EstadoBoleta.ACTIVO,
      tipo: TipoBoleta.SEGUROS,
      telefonos: ['5555-1234', '5555-5678'],
      siniestro: {
        tipo: 'Asistencia',
        nombreReportante: 'María García',
        nombrePiloto: 'Juan Pérez',
        descripcion: 'Vehículo con falla mecánica',
        terceroCulpable: false,
        compromisoPago: false
      },
      vehiculo: {
        marca: 'Toyota',
        linea: 'Corolla',
        color: 'Blanco',
        placa: 'P-123ABC',
        modelo: '2020',
        tipo: 'Sedán'
      },
      asegurado: {
        numeroPoliza: 'POL-123456',
        titular: 'Juan Pérez',
        intermediario: 'Agente 1',
        tipoCliente: 'Individual'
      },
      reclamo: {
        numero: 'REC-001'
      },
      observaciones: ['Cliente solicita grúa', 'Vehículo no enciende'],
      servicios: [
        {
          id: 1,
          tipo: 'Grúa',
          estado: 'Pendiente',
          fechaAsignacion: new Date()
        }
      ],
      direccion: {
        ubicacion: 'Zona 10, Ciudad',
        zona: '10',
        calleAvenida: '5ta Avenida',
        numeroCasa: '12-34',
        referencia: 'Frente al parque'
      },
      tiempos: {
        horaDespacho: new Date(),
        tiempoDespacho: '0 Días, 00:04:12',
        tiempoLlegada: '0 Días, 00:45:55',
        tiempoAtencion: '0 Días, 00:00:00'
      },
      costos: {
        servicio: 'Grúa',
        unidades: 1,
        kmTerracerias: 0,
        kmRecorrido: 15,
        kmVacio: 5,
        costoManiobra: 100,
        costoEspera: 0,
        tarifaBase: 150,
        tarifaKmTerracerias: 10,
        tarifaKmRecorrido: 10,
        tarifaKmVacio: 5
      },
      proveedor: {
        nombre: 'Grúas Andre',
        telefonos: ['56902131', '41517015', '50169152'],
        tipo: 'Grúa',
        base: 'Base Central'
      }
    },
    {
      id: 2,
      numero: 'BOL-002',
      fecha: new Date(),
      estado: EstadoBoleta.ACTIVO,
      tipo: TipoBoleta.SEGUROS,
      telefonos: ['5555-8888'],
      siniestro: {
        tipo: 'Asistencia',
        nombreReportante: 'Somit Somit',
        nombrePiloto: 'Joel Sandoval',
        descripcion: 'Cambio de llanta',
        terceroCulpable: false,
        compromisoPago: false
      },
      vehiculo: {
        marca: 'Honda',
        linea: 'Civic',
        color: 'Negro',
        placa: 'P-789XYZ',
        modelo: '2021',
        tipo: 'Sedán'
      },
      asegurado: {
        numeroPoliza: 'AUTO-273655-1998',
        titular: 'Joel Sandoval',
        intermediario: 'Agente 2',
        tipoCliente: 'Individual'
      },
      reclamo: {},
      observaciones: ['Llanta ponchada'],
      servicios: [
        {
          id: 2,
          tipo: 'Mecánico',
          estado: 'Activo',
          fechaAsignacion: new Date()
        }
      ],
      direccion: {
        ubicacion: '2 calle lote 3, parcelamientos velasquitos, la democracia escuintla',
        zona: '1',
        calleAvenida: '2 calle',
        numeroCasa: 'lote 3',
        referencia: 'Parcelamientos velasquitos'
      },
      tiempos: {
        horaDespacho: new Date(),
        tiempoDespacho: '0 Días, 00:02:30',
        tiempoLlegada: '0 Días, 00:30:00',
        tiempoAtencion: '0 Días, 00:00:00'
      },
      costos: {
        servicio: 'Mecánico',
        unidades: 1,
        kmTerracerias: 0,
        kmRecorrido: 8,
        kmVacio: 3,
        costoManiobra: 50,
        costoEspera: 0,
        tarifaBase: 100,
        tarifaKmTerracerias: 10,
        tarifaKmRecorrido: 8,
        tarifaKmVacio: 4
      },
      proveedor: {
        nombre: 'Mecánicos Express',
        telefonos: ['55556789'],
        tipo: 'Mecánico',
        base: 'Base Sur'
      }
    }
  ];

  constructor(private http: HttpClient) {
    // Inicializar el array de boletas simuladas si está vacío
    console.log('Inicializando servicio de boletas');
    console.log('Boletas simuladas iniciales:', this.boletasSimuladas.length);
  }

  // Método para generar un nuevo ID único
  private generarNuevoId(): number {
    if (this.boletasSimuladas.length === 0) {
      return 1;
    }

    // Encontrar el ID más alto y sumarle 1
    const maxId = Math.max(...this.boletasSimuladas.map(b => b.id));
    return maxId + 1;
  }

  // Método para generar un nuevo número de boleta
  private generarNuevoNumeroBoleta(id: number): string {
    return `BOL-${String(id).padStart(3, '0')}`;
  }

  // Obtener todas las boletas
  getBoletas(): Observable<Boleta[]> {
    // return this.http.get<Boleta[]>(this.apiUrl);
    console.log('Obteniendo todas las boletas. Total:', this.boletasSimuladas.length);
    return of([...this.boletasSimuladas]).pipe(
      delay(500), // Simular tiempo de respuesta del servidor
      tap(boletas => console.log(`Obtenidas ${boletas.length} boletas`))
    );
  }

  // Obtener boleta por número
  getBoletaPorNumero(numero: string): Observable<Boleta> {
    const boleta = this.boletasSimuladas.find(b => b.numero === numero);
    if (boleta) {
      return of(boleta);
    }
    return throwError(() => new Error('No se encontró la boleta con el número especificado'));
  }

  // Obtener boletas por estado
  getBoletasPorEstado(estado: EstadoBoleta): Observable<Boleta[]> {
    const boletas = this.boletasSimuladas.filter(b => b.estado === estado);
    return of(boletas);
  }

  // Obtener una boleta específica
  getBoleta(id: number): Observable<Boleta> {
    const boleta = this.boletasSimuladas.find(b => b.id === id);
    if (boleta) {
      return of(boleta);
    }
    return throwError(() => new Error('No se encontró la boleta especificada'));
  }

  // Actualizar estado de boleta
  actualizarEstado(id: number, estado: EstadoBoleta): Observable<Boleta> {
    const boleta = this.boletasSimuladas.find(b => b.id === id);
    if (boleta) {
      boleta.estado = estado;
      return of(boleta);
    }
    return throwError(() => new Error('No se encontró la boleta para actualizar'));
  }

  // Actualizar boleta
  actualizarBoleta(id: number, boletaActualizada: Partial<Boleta>): Observable<Boleta> {
    const index = this.boletasSimuladas.findIndex(b => b.id === id);
    if (index !== -1) {
      this.boletasSimuladas[index] = { ...this.boletasSimuladas[index], ...boletaActualizada };
      return of(this.boletasSimuladas[index]);
    }
    return throwError(() => new Error('No se encontró la boleta para actualizar'));
  }

  /**
   * Determina el tipo de siniestro basado en la información del incidente
   */
  private determinarTipoSiniestro(notificacion: NotificacionIncidente): string {
    const tipoIncidente = notificacion.incident?.incident_type || '';

    if (tipoIncidente.includes('choque') || tipoIncidente.includes('colision')) {
      return 'Colisión';
    } else if (tipoIncidente.includes('averia') || tipoIncidente.includes('falla')) {
      return 'Avería';
    } else if (tipoIncidente.includes('llanta') || tipoIncidente.includes('neumatico')) {
      return 'Cambio de llanta';
    } else {
      return 'Asistencia';
    }
  }

  /**
   * Determina el tipo de servicio basado en la información del incidente
   */
  private determinarTipoServicio(notificacion: NotificacionIncidente): string {
    const tipoIncidente = notificacion.incident?.incident_type || '';

    if (tipoIncidente.includes('grua') || tipoIncidente.includes('remolque')) {
      return 'Grúa';
    } else if (tipoIncidente.includes('llanta') || tipoIncidente.includes('neumatico')) {
      return 'Mecánico';
    } else if (tipoIncidente.includes('combustible') || tipoIncidente.includes('gasolina')) {
      return 'Combustible';
    } else {
      return 'Asistencia Vial';
    }
  }

  /**
   * Crea una nueva boleta a partir de los datos de una notificación de incidente
   * @param notificacion Datos de la notificación recibida
   */
  crearBoletaDesdeNotificacion(notificacion: NotificacionIncidente): Observable<Boleta> {
    console.log('Creando boleta desde notificación:', notificacion);

    try {
      // Generar un nuevo ID y número de boleta
      const nuevoId = this.generarNuevoId();
      const nuevoNumero = this.generarNuevoNumeroBoleta(nuevoId);

      console.log(`Generando nueva boleta con ID: ${nuevoId}, Número: ${nuevoNumero}`);

      // Extraer información de la ubicación
      const ubicacion = notificacion.location?.address || '';
      const partes = ubicacion.split(',');
      const calleAvenida = partes.length > 0 ? partes[0].trim() : '';
      const zona = this.extraerZona(ubicacion);

      // Usar una sola instancia de Date para todas las fechas
      const fechaActual = new Date();

      // Determinar el tipo de siniestro y servicio
      const tipoSiniestro = this.determinarTipoSiniestro(notificacion);
      const tipoServicio = this.determinarTipoServicio(notificacion);

      // Crear la nueva boleta
      const nuevaBoleta: Boleta = {
        id: nuevoId,
        numero: nuevoNumero,
        fecha: fechaActual,
        estado: EstadoBoleta.ACTIVO,
        tipo: TipoBoleta.SEGUROS,
        telefonos: [],
        siniestro: {
          tipo: tipoSiniestro,
          nombreReportante: notificacion.vehicle?.nombre_propietario || 'Sin nombre',
          nombrePiloto: notificacion.vehicle?.nombre_propietario || 'Sin nombre',
          descripcion: notificacion.incident?.description || 'Sin descripción',
          terceroCulpable: false,
          compromisoPago: false
        },
        vehiculo: {
          marca: notificacion.vehicle?.marca || 'Desconocida',
          linea: notificacion.vehicle?.modelo || 'Desconocido',
          color: notificacion.vehicle?.color || 'Desconocido',
          placa: notificacion.vehicle?.placa || 'Sin placa',
          modelo: notificacion.vehicle?.año || 'Desconocido',
          tipo: notificacion.vehicle?.tipo || 'Desconocido'
        },
        asegurado: {
          numeroPoliza: 'Sin póliza',
          titular: notificacion.vehicle?.nombre_propietario || 'Sin nombre',
          intermediario: 'Agente Web',
          tipoCliente: 'Individual'
        },
        reclamo: {},
        observaciones: [notificacion.incident?.description || 'Sin observaciones'],
        servicios: [
          {
            id: nuevoId,
            tipo: tipoServicio,
            estado: 'Pendiente',
            fechaAsignacion: fechaActual
          }
        ],
        direccion: {
          ubicacion: ubicacion,
          zona: zona,
          calleAvenida: calleAvenida,
          numeroCasa: '',
          referencia: notificacion.location?.city || ''
        },
        tiempos: {
          horaDespacho: fechaActual,
          tiempoDespacho: '0 Días, 00:00:00',
          tiempoLlegada: '0 Días, 00:00:00',
          tiempoAtencion: '0 Días, 00:00:00'
        },
        costos: {
          servicio: tipoServicio,
          unidades: 1,
          kmTerracerias: 0,
          kmRecorrido: 0,
          kmVacio: 0,
          costoManiobra: 0,
          costoEspera: 0,
          tarifaBase: 0,
          tarifaKmTerracerias: 0,
          tarifaKmRecorrido: 0,
          tarifaKmVacio: 0
        },
        proveedor: {
          nombre: '',
          telefonos: [],
          tipo: tipoServicio,
          base: ''
        }
      };

      // Agregar la nueva boleta al array de boletas simuladas
      this.boletasSimuladas.unshift(nuevaBoleta); // Agregar al inicio para que aparezca primero
      console.log(`Nueva boleta creada y agregada. Total boletas: ${this.boletasSimuladas.length}`);
      console.log('Detalles de la nueva boleta:', nuevaBoleta);

      // Devolver la nueva boleta
      return of(nuevaBoleta);
    } catch (error) {
      console.error('Error al crear boleta:', error);
      return throwError(() => new Error('Error al crear la boleta: ' + error));
    }
  }

  private extraerZona(ubicacion: string): string {
    const partes = ubicacion.split(',');
    if (partes.length > 1) {
      return partes[1].trim().replace(/[^\d]/g, '');
    }
    return 'Pendiente';
  }
}
