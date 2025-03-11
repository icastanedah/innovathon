import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NotificacionIncidente, ApiResponse, Incidente } from '../interfaces/notificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8081/api/angular';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los incidentes disponibles
   */
  obtenerIncidentes(): Observable<Incidente[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/incidents`)
      .pipe(
        map(response => {
          console.log('Respuesta de la API:', response);
          if (response && response.success && response.incidents) {
            return response.incidents;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error al obtener incidentes:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Consulta periódicamente los incidentes disponibles
   * @param intervalo Intervalo de consulta en milisegundos
   */
  consultarIncidentesPeriodicamente(intervalo: number = 5000): Observable<Incidente[]> {
    return timer(0, intervalo).pipe(
      switchMap(() => this.obtenerIncidentes()),
      catchError(error => {
        console.error('Error al consultar incidentes periódicamente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los datos de un incidente específico
   * @param incidente Incidente a procesar
   */
  obtenerDatosIncidente(incidente: Incidente): Observable<NotificacionIncidente> {
    console.log('Procesando incidente:', incidente);

    // Verificar que el incidente tenga todas las propiedades necesarias
    if (!incidente) {
      console.error('El incidente es undefined');
      return throwError(() => new Error('El incidente es undefined'));
    }

    // Verificar y proporcionar valores por defecto para las propiedades que podrían ser undefined
    const incident_info = incidente.incident_info || {
      damage_type: 'Desconocido',
      severity: 'Baja',
      description: 'Sin descripción',
      date: new Date().toISOString()
    };

    const vehicle_info = incidente.vehicle_info || {
      plate: 'Sin placa',
      make: 'Desconocido',
      model: 'Desconocido',
      year: 'Desconocido',
      color: 'Desconocido'
    };

    const insurance_info = incidente.insurance_info || {
      holder_name: 'Sin nombre',
      policy_number: 'Sin póliza',
      card_number: 'Sin tarjeta',
      expiration_date: 'Sin fecha'
    };

    const location = incidente.location || {
      latitude: 0,
      longitude: 0,
      address: 'Dirección desconocida',
      reference: 'Sin referencia'
    };

    // Convertir el formato del incidente al formato esperado por el resto de la aplicación
    const notificacion: NotificacionIncidente = {
      incident: {
        incident_type: incident_info.damage_type,
        damage_severity: incident_info.severity,
        description: incident_info.description
      },
      vehicle: {
        placa: vehicle_info.plate,
        nombre_propietario: insurance_info.holder_name,
        marca: vehicle_info.make,
        modelo: vehicle_info.model,
        año: vehicle_info.year,
        color: vehicle_info.color,
        tipo: 'Automóvil' // Valor por defecto
      },
      location: {
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        address: location.address,
        city: '', // No disponible en la respuesta
        country: '' // No disponible en la respuesta
      },
      timestamp: incidente.timestamp || new Date().toISOString(),
      status: incidente.status || 'Pendiente'
    };

    return new Observable(observer => {
      observer.next(notificacion);
      observer.complete();
    });
  }

  /**
   * Obtiene los datos de notificación desde la API
   */
  obtenerDatosNotificacion(): Observable<NotificacionIncidente> {
    return this.http.get<any>(`${this.apiUrl}/data/0`)
      .pipe(
        map(response => {
          console.log('Respuesta de la API:', response);
          // Asumimos que la respuesta ya tiene el formato correcto o la transformamos aquí
          return response as NotificacionIncidente;
        }),
        catchError(error => {
          console.error('Error al obtener datos de notificación:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Configura el endpoint para recibir notificaciones
   */
  configurarEndpointNotificaciones(): Observable<any> {
    // En un entorno real, esto podría configurar un WebSocket o SSE
    return this.http.get(`${this.apiUrl}/configure`)
      .pipe(
        catchError(error => {
          console.error('Error al configurar endpoint de notificaciones:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Simula el envío de una notificación para pruebas
   * En este caso, obtenemos los datos reales de la API
   */
  simularNotificacion(): Observable<NotificacionIncidente> {
    return this.obtenerDatosNotificacion();
  }
}
