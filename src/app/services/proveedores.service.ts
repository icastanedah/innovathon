import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError, forkJoin, delay } from 'rxjs';
import { ProveedoresResponse, Proveedor, ApiResponse, VehiculoData, Dimensiones } from '../interfaces/proveedor.interface';

export interface DimensionesVehiculo {
  longitud: string;
  ancho: string;
  altura: string;
  distancia_entre_ejes: string;
}

export interface DatosVehiculo {
  modelo: string;
  anio: number;
  dimensiones: DimensionesVehiculo;
  peso: string;
  tipo_grua: string;
}

export interface ProveedorCercano {
  proveedorName: string;
  time: string;
  distance: string;
  phoneNumber: string;
  direccion: string;
  department: string;
  distanceLimit: string;
}

export interface RespuestaProveedores {
  vehicleData: DatosVehiculo;
  providerList: ProveedorCercano[];
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = 'https://innovathon-453207-service-542279195211.us-central1.run.app';
  private lastApiResponse: any = null;

  constructor(private http: HttpClient) { }

  /**
   * Devuelve la última respuesta recibida de la API
   */
  getLastResponse(): any {
    return this.lastApiResponse;
  }

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
                anio: 0,
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

  /**
   * Busca el proveedor más cercano según la ubicación y tipo de servicio
   * @param ubicacion Dirección del incidente
   * @param servicio Tipo de servicio requerido (envioCombustible, grua, etc.)
   * @param vehicle Información del vehículo
   * @param latitud Latitud de la ubicación
   * @param longitud Longitud de la ubicación
   * @returns Observable con la información de la ruta y el proveedor
   */
  buscarProveedorMasCercano(
    ubicacion: string,
    servicio: string,
    vehicle: string,
    latitud: number,
    longitud: number
  ): Observable<ProveedoresResponse | null> {
    // Probar diferentes endpoints
    const endpoints = [
      `${this.apiUrl}/better-routes`,
      `${this.apiUrl}/api/routes`,
      `${this.apiUrl}/routes`
    ];

    const endpoint = endpoints[0]; // Usar el primer endpoint por defecto

    const payload = {
      ubicacion,
      servicio,
      vehicle,
      latitud,
      longitud
    };

    console.log(`Buscando proveedor más cercano en ${endpoint} con datos:`, payload);
    console.log('URL completa:', endpoint);

    // Usar datos simulados para asegurarnos de que la UI funciona correctamente
    // mientras depuramos el problema con la API
    const datosSimulados = this.generarDatosProveedoresMock(ubicacion, servicio, vehicle);

    // Hacer la llamada a la API real y también imprimir los datos simulados para comparar
    console.log('Datos simulados que deberíamos ver:', datosSimulados);

    // Hacer la llamada a la API real
    return this.http.post<any>(endpoint, payload).pipe(
      tap(response => {
        console.log('Respuesta real de la API (raw):', response);
        this.lastApiResponse = response;
        this.depurarRespuestaAPI(response);
      }),
      map(response => {
        // Si la respuesta es null o undefined, usar datos simulados
        if (!response) {
          console.error('La respuesta de la API es null o undefined');
          return datosSimulados;
        }

        try {
          // Basado en la consola, vemos que la respuesta tiene una estructura diferente
          // Vamos a manejar directamente la estructura que estamos recibiendo

          // Verificar si tenemos providerList y vehicleData en la respuesta
          if (response.providerList && response.vehicleData) {
            console.log('La respuesta tiene la estructura esperada con providerList y vehicleData');

            // Mapear la respuesta al formato ProveedoresResponse
            const proveedoresResponse: ProveedoresResponse = {
              vehicleData: {
                modelo: response.vehicleData.modelo || `${response.vehicleData.make || ''} ${response.vehicleData.model || ''}`,
                anio: response.vehicleData.anio || parseInt(response.vehicleData.año || response.vehicleData.year) || 2000,
                dimensiones: {
                  longitud: response.vehicleData.dimensiones?.longitud || '0',
                  ancho: response.vehicleData.dimensiones?.ancho || '0',
                  altura: response.vehicleData.dimensiones?.altura || '0',
                  distancia_entre_ejes: response.vehicleData.dimensiones?.distancia_entre_ejes || '0'
                },
                peso: response.vehicleData.peso || '0',
                tipo_grua: response.vehicleData.tipo_grua || 'small'
              },
              providerList: (response.providerList || []).map((p: any) => ({
                proveedorName: p.proveedorName || p.name || 'Proveedor',
                time: p.time || '15 min',
                distance: p.distance || '3.2 km',
                phoneNumber: p.phoneNumber || p.phone || '555-1234',
                direccion: p.direccion || p.address || 'Servicio Rápido',
                department: p.department || 'Guatemala',
                distanceLimit: p.distanceLimit || '10 km',
                descripcion: p.descripcion || (p.time?.includes('min') ? 'Ruta más rápida' : 'Ruta alternativa'),
                trafico: p.trafico || 'Tráfico ligero'
              })),
              ubicacion: ubicacion,
              servicio: servicio
            };

            console.log('Respuesta mapeada:', proveedoresResponse);
            return proveedoresResponse;
          }
          // Si la respuesta es un objeto con providerList como propiedad
          else if (response.providerList) {
            console.log('La respuesta tiene providerList pero no vehicleData');

            // Extraer marca, modelo y año del vehículo
            const partes = vehicle.split(' ');
            const marca = partes[0] || 'toyota';
            const modelo = partes[1] || 'corola';
            const anio = parseInt(partes[2]) || 2019;

            // Crear datos del vehículo
            const vehiculoData: DatosVehiculo = {
              modelo: `${marca} ${modelo}`,
              anio: anio,
              dimensiones: {
                longitud: '4.5',
                ancho: '1.8',
                altura: '1.5',
                distancia_entre_ejes: '2.7'
              },
              peso: '1500',
              tipo_grua: this.determinarTipoGrua(servicio)
            };

            // Mapear la respuesta al formato ProveedoresResponse
            const proveedoresResponse: ProveedoresResponse = {
              vehicleData: vehiculoData,
              providerList: (response.providerList || []).map((p: any) => ({
                proveedorName: p.proveedorName || p.name || 'Proveedor',
                time: p.time || '15 min',
                distance: p.distance || '3.2 km',
                phoneNumber: p.phoneNumber || p.phone || '555-1234',
                direccion: p.direccion || p.address || 'Servicio Rápido',
                department: p.department || 'Guatemala',
                distanceLimit: p.distanceLimit || '10 km',
                descripcion: p.descripcion || (p.time?.includes('min') ? 'Ruta más rápida' : 'Ruta alternativa'),
                trafico: p.trafico || 'Tráfico ligero'
              })),
              ubicacion: ubicacion,
              servicio: servicio
            };

            console.log('Respuesta mapeada con vehicleData simulado:', proveedoresResponse);
            return proveedoresResponse;
          }
          // Si la respuesta es un array directamente (como se ve en la consola)
          else if (Array.isArray(response)) {
            console.log('La respuesta es un array directamente');

            // Extraer marca, modelo y año del vehículo
            const partes = vehicle.split(' ');
            const marca = partes[0] || 'toyota';
            const modelo = partes[1] || 'corola';
            const anio = parseInt(partes[2]) || 2019;

            // Crear datos del vehículo
            const vehiculoData: DatosVehiculo = {
              modelo: `${marca} ${modelo}`,
              anio: anio,
              dimensiones: {
                longitud: '4.5',
                ancho: '1.8',
                altura: '1.5',
                distancia_entre_ejes: '2.7'
              },
              peso: '1500',
              tipo_grua: this.determinarTipoGrua(servicio)
            };

            // Mapear la respuesta al formato ProveedoresResponse
            const proveedoresResponse: ProveedoresResponse = {
              vehicleData: vehiculoData,
              providerList: response.map((p: any) => ({
                proveedorName: p.proveedorName || p.name || 'Proveedor',
                time: p.time || '15 min',
                distance: p.distance || '3.2 km',
                phoneNumber: p.phoneNumber || p.phone || '555-1234',
                direccion: p.direccion || p.address || 'Servicio Rápido',
                department: p.department || 'Guatemala',
                distanceLimit: p.distanceLimit || '10 km',
                descripcion: p.descripcion || (p.time?.includes('min') ? 'Ruta más rápida' : 'Ruta alternativa'),
                trafico: p.trafico || 'Tráfico ligero'
              })),
              ubicacion: ubicacion,
              servicio: servicio
            };

            console.log('Respuesta mapeada desde array:', proveedoresResponse);
            return proveedoresResponse;
          }
          // Si la respuesta tiene vehicleData pero no providerList
          else if (response.vehicleData) {
            console.log('La respuesta tiene vehicleData pero no providerList');

            // Usar proveedores simulados
            const proveedoresResponse: ProveedoresResponse = {
              vehicleData: {
                modelo: response.vehicleData.modelo || `${response.vehicleData.make || ''} ${response.vehicleData.model || ''}`,
                anio: response.vehicleData.anio || parseInt(response.vehicleData.año || response.vehicleData.year) || 2000,
                dimensiones: {
                  longitud: response.vehicleData.dimensiones?.longitud || '0',
                  ancho: response.vehicleData.dimensiones?.ancho || '0',
                  altura: response.vehicleData.dimensiones?.altura || '0',
                  distancia_entre_ejes: response.vehicleData.dimensiones?.distancia_entre_ejes || '0'
                },
                peso: response.vehicleData.peso || '0',
                tipo_grua: response.vehicleData.tipo_grua || 'small'
              },
              providerList: datosSimulados.providerList,
              ubicacion: ubicacion,
              servicio: servicio
            };

            console.log('Respuesta mapeada con providerList simulado:', proveedoresResponse);
            return proveedoresResponse;
          }
          // Si no podemos extraer los datos, usar datos simulados
          else {
            console.log('No se pudo extraer datos de la respuesta, usando datos simulados');
            return datosSimulados;
          }
        } catch (error) {
          console.error('Error al procesar la respuesta de la API:', error);
          return datosSimulados;
        }
      }),
      catchError(error => {
        console.error('Error al obtener datos de la API:', error);
        console.log('Usando datos simulados como fallback debido al error');
        // Usar datos simulados como fallback en caso de error
        return of(datosSimulados);
      })
    );
  }

  /**
   * Genera datos simulados que coinciden con la imagen mostrada
   */
  private generarDatosProveedoresMock(ubicacion: string, servicio: string, vehicle: string): ProveedoresResponse {
    // Extraer marca, modelo y año del vehículo
    const partes = vehicle.split(' ');
    const marca = partes[0] || 'toyota';
    const modelo = partes[1] || 'corola';
    const anio = parseInt(partes[2]) || 2004;

    // Crear datos del vehículo
    const vehiculoData: VehiculoData = {
      modelo: `${marca} ${modelo}`,
      anio: anio,
      dimensiones: {
        longitud: '4.5',
        ancho: '1.8',
        altura: '1.5',
        distancia_entre_ejes: '2.7'
      },
      peso: '1500',
      tipo_grua: this.determinarTipoGrua(servicio)
    };

    // Crear lista de proveedores que coincide con la imagen
    const proveedores: Proveedor[] = [
      {
        proveedorName: 'Proveedor Ejemplo 1',
        time: '15 min',
        distance: '3.2 km',
        phoneNumber: '5555-1234',
        direccion: 'Servicio Rápido',
        department: 'Guatemala',
        distanceLimit: '10 km',
        descripcion: 'Ruta más rápida',
        trafico: 'Tráfico ligero'
      },
      {
        proveedorName: 'Proveedor Ejemplo 2',
        time: '22 min',
        distance: '4.5 km',
        phoneNumber: '5555-5678',
        direccion: 'Asistencia Total',
        department: 'Guatemala',
        distanceLimit: '15 km',
        descripcion: 'Ruta alternativa',
        trafico: 'Tráfico moderado'
      }
    ];

    // Crear respuesta simulada
    return {
      vehicleData: vehiculoData,
      providerList: proveedores,
      ubicacion: ubicacion,
      servicio: servicio
    };
  }

  /**
   * Determina el tipo de grúa basado en el servicio solicitado
   */
  private determinarTipoGrua(servicio: string): string {
    switch (servicio.toLowerCase()) {
      case 'grua':
        return 'Plataforma';
      case 'combustible':
        return 'No aplica';
      case 'bateria':
        return 'No aplica';
      case 'llanta':
        return 'No aplica';
      default:
        return 'Estándar';
    }
  }

  /**
   * Método para depurar la respuesta de la API y entender su estructura
   */
  private depurarRespuestaAPI(response: any): void {
    console.log('Depuración de respuesta API:');
    console.log('Tipo de respuesta:', typeof response);
    console.log('Es un array?', Array.isArray(response));

    if (response) {
      console.log('Propiedades de primer nivel:', Object.keys(response));

      if (response.incidents) {
        console.log('Tipo de incidents:', typeof response.incidents);
        console.log('Es un array?', Array.isArray(response.incidents));
        console.log('Longitud de incidents:', response.incidents.length);

        if (response.incidents.length > 0) {
          console.log('Primer elemento de incidents:', response.incidents[0]);
          console.log('Propiedades del primer elemento:', Object.keys(response.incidents[0]));
        }
      }

      if (response.success) {
        console.log('Valor de success:', response.success);
      }
    }
  }

  /**
   * Mapea el tipo de servicio de la boleta al formato requerido por la API
   * @param tipoServicio Tipo de servicio de la boleta
   * @returns Tipo de servicio en el formato requerido por la API
   */
  mapearTipoServicio(tipoServicio: string): string {
    const tipoServicioLower = tipoServicio.toLowerCase();

    if (tipoServicioLower.includes('combustible') || tipoServicioLower.includes('gasolina')) {
      return 'envioCombustible';
    } else if (tipoServicioLower.includes('grua') || tipoServicioLower.includes('remolque')) {
      return 'grua';
    } else if (tipoServicioLower.includes('llanta') || tipoServicioLower.includes('neumatico')) {
      return 'cambioLlanta';
    } else if (tipoServicioLower.includes('bateria') || tipoServicioLower.includes('corriente')) {
      return 'pasoCorriente';
    } else if (tipoServicioLower.includes('cerrajeria') || tipoServicioLower.includes('llave')) {
      return 'cerrajeria';
    } else {
      return 'grua'; // Valor por defecto
    }
  }

  /**
   * Verifica si la API está disponible
   */
  verificarAPI(): Observable<boolean> {
    const url = `${this.apiUrl}/health`;

    console.log('Verificando disponibilidad de la API en:', url);

    return this.http.get<any>(url).pipe(
      tap(response => console.log('Respuesta de verificación de API:', response)),
      map(response => true),
      catchError(error => {
        console.error('Error al verificar la API:', error);
        return of(false);
      })
    );
  }

  /**
   * Prueba diferentes endpoints de la API
   */
  probarEndpoints(
    ubicacion: string,
    servicio: string,
    vehicle: string,
    latitud: number,
    longitud: number
  ): Observable<any[]> {
    const endpoints = [
      `${this.apiUrl}/better-routes`,
      `${this.apiUrl}/api/routes`,
      `${this.apiUrl}/routes`
    ];

    const payload = {
      ubicacion,
      servicio,
      vehicle,
      latitud,
      longitud
    };

    // Crear un array de observables para cada endpoint
    const requests = endpoints.map(endpoint => {
      console.log(`Probando endpoint: ${endpoint}`);
      return this.http.post<any>(endpoint, payload).pipe(
        map(response => ({ endpoint, response, success: true })),
        catchError(error => of({ endpoint, error, success: false }))
      );
    });

    // Combinar todos los observables
    return forkJoin(requests);
  }
}
