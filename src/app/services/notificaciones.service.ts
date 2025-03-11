import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap, takeUntil } from 'rxjs/operators';
import { NotificacionIncidente, Incidente } from '../interfaces/notificacion.interface';
import { BoletasService } from './boletas.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'http://localhost:8081/api/angular';
  private endpointActivo = false;
  private stopPolling = new Subject<void>();

  // Observable para los incidentes
  private incidentesSubject = new BehaviorSubject<Incidente[]>([]);
  public incidentes$ = this.incidentesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private boletasService: BoletasService,
    private apiService: ApiService
  ) { }

  /**
   * Inicia la consulta periódica de incidentes
   * @param intervalo Intervalo de consulta en milisegundos
   */
  iniciarConsultaPeriodica(intervalo: number = 5000): void {
    console.log('Iniciando consulta periódica de incidentes...');
    this.endpointActivo = true;

    this.apiService.consultarIncidentesPeriodicamente(intervalo)
      .pipe(takeUntil(this.stopPolling))
      .subscribe({
        next: (incidentes) => {
          console.log('Incidentes actualizados:', incidentes);
          this.incidentesSubject.next(incidentes);
        },
        error: (error) => {
          console.error('Error en la consulta periódica:', error);
        }
      });
  }

  /**
   * Detiene la consulta periódica de incidentes
   */
  detenerConsultaPeriodica(): void {
    console.log('Deteniendo consulta periódica de incidentes...');
    this.stopPolling.next();
    this.endpointActivo = false;
    this.incidentesSubject.next([]);
  }

  /**
   * Verifica si el endpoint está activo
   */
  isEndpointActivo(): boolean {
    return this.endpointActivo;
  }

  /**
   * Obtiene los datos de un incidente específico y crea una boleta
   * @param incidente Incidente a procesar
   */
  procesarIncidente(incidente: Incidente): Observable<any> {
    console.log('Procesando incidente en NotificacionesService:', incidente);

    if (!incidente) {
      console.error('Error: El incidente es undefined');
      return throwError(() => new Error('El incidente es undefined'));
    }

    return this.apiService.obtenerDatosIncidente(incidente)
      .pipe(
        tap(notificacion => console.log('Datos de incidente obtenidos:', notificacion)),
        switchMap(notificacion => {
          if (!notificacion) {
            console.error('Error: La notificación es undefined');
            return throwError(() => new Error('La notificación es undefined'));
          }
          return this.procesarNotificacion(notificacion);
        }),
        catchError(error => {
          console.error('Error al procesar incidente en NotificacionesService:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Procesa una notificación de incidente recibida
   * @param notificacion Datos de la notificación recibida
   */
  procesarNotificacion(notificacion: NotificacionIncidente): Observable<any> {
    console.log('Procesando notificación en NotificacionesService:', notificacion);

    if (!notificacion) {
      console.error('Error: La notificación es undefined');
      return throwError(() => new Error('La notificación es undefined'));
    }

    return this.boletasService.crearBoletaDesdeNotificacion(notificacion)
      .pipe(
        tap(resultado => console.log('Boleta creada en NotificacionesService:', resultado)),
        catchError(error => {
          console.error('Error al procesar notificación en NotificacionesService:', error);
          return throwError(() => error);
        })
      );
  }
}
