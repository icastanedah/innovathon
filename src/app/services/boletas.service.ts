import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Boleta, EstadoBoleta, TipoBoleta } from '../interfaces/boleta.interface';

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

  constructor(private http: HttpClient) { }

  // Obtener todas las boletas
  getBoletas(): Observable<Boleta[]> {
    // return this.http.get<Boleta[]>(this.apiUrl);
    return of(this.boletasSimuladas);
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
} 