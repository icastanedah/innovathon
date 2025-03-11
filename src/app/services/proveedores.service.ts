import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProveedoresResponse, Proveedor } from '../interfaces/proveedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = 'http://localhost:8081/api/angular';

  constructor(private http: HttpClient) { }

  /**
   * Busca proveedores cercanos para un incidente
   * @param incidenteId ID del incidente
   * @param ubicacion Ubicación del incidente (latitud, longitud)
   * @param tipoServicio Tipo de servicio requerido
   */
  buscarProveedores(incidenteId: string, ubicacion: { latitud: number, longitud: number }, tipoServicio: string): Observable<ProveedoresResponse> {
    // Construir la URL con los parámetros necesarios
    const url = `${this.apiUrl}/providers`;

    // Parámetros de la solicitud
    const params = {
      incident_id: incidenteId,
      latitude: ubicacion.latitud.toString(),
      longitude: ubicacion.longitud.toString(),
      service_type: tipoServicio
    };

    console.log('Enviando solicitud a:', url);
    console.log('Con parámetros:', params);

    return this.http.get<ProveedoresResponse>(url, { params })
      .pipe(
        map(response => {
          console.log('Respuesta de proveedores (raw):', response);

          // Verificar si la respuesta tiene la estructura esperada
          if (!response || typeof response !== 'object') {
            console.error('Respuesta inválida:', response);
            throw new Error('Respuesta inválida del servidor');
          }

          // Si la respuesta no tiene la estructura esperada, intentar adaptarla
          if (!response.vehicleData || !response.providerList) {
            console.warn('Estructura de respuesta inesperada, intentando adaptar:', response);

            // Ejemplo de adaptación (ajustar según la estructura real)
            const adaptedResponse: ProveedoresResponse = {
              vehicleData: {
                modelo: 'Desconocido',
                año: 0,
                dimensiones: {
                  longitud: '0',
                  ancho: '0',
                  altura: '0',
                  distancia_entre_ejes: '0'
                },
                peso: '0',
                tipo_grua: 'Desconocido'
              },
              providerList: Array.isArray(response) ? response : []
            };

            return adaptedResponse;
          }

          return response;
        }),
        catchError(error => {
          console.error('Error al buscar proveedores:', error);
          return throwError(() => new Error(`Error al buscar proveedores: ${error.message || 'Error desconocido'}`));
        })
      );
  }
}
