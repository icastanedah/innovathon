import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BoletasService } from '../../services/boletas.service';
import { Boleta } from '../../interfaces/boleta.interface';

interface RouteOption {
  name: string;
  duration: string;
  color: string;
  distance: string;
  description: string;
  toll: boolean;
  traffic: string;
  icon: string;
  serviceType: string;
  provider?: Provider;
}

interface Provider {
  name: string;
  address?: string;
  distance: string;
  phone?: string;
  rating?: number;
  openHours?: string;
  services?: string[];
  time?: string;
  serviceType: string;
}

interface ApiResponse {
  proveedorName: string;
  time: string;
  distance: string;
  phoneNumber?: string;
  direccion?: string;
  department?: string;
  distanceLimit?: string;
  descripcion?: string;
  trafico?: string;
}

interface ApiResponseData {
  providerList: ApiResponse[];
  vehicleData: {
    modelo: string;
    anio?: number;
    año?: number;
    dimensiones?: {
      longitud: string;
      ancho: string;
      altura: string;
      distancia_entre_ejes: string;
    };
    peso: string;
    tipo_grua: string;
  };
}

interface LocationRequest {
  ubicacion: string;
  servicio: string;
  vehicle: string;
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    StepperModule,
    CardModule,
    DropdownModule,
    SelectButtonModule,
    RouterModule,
    TooltipModule
  ],
  templateUrl: './boletas.component.html',
  styleUrls: ['./boletas.component.scss'],
})
export class BoletasComponent implements OnInit {
  map: google.maps.Map | undefined;
  marker: google.maps.Marker | undefined;
  geocoder: google.maps.Geocoder | undefined;
  direccion: string = '';
  latitud: number = 15.7835;
  longitud: number = -90.2308;
  activeStep: number = 1;
  routeOptions: RouteOption[] = [];
  nearestProvider: Provider | null = null;
  selectedRoute: RouteOption | null = null;
  serviceType: string = 'envioCombustible';
  vehiculo: string = '';
  isLoading: boolean = false;
  boletaActual: Boleta | null = null;
  boletaId: number | null = null;
  cargandoBoleta: boolean = false;

  serviceOptions = [
    { label: 'Paso de Corriente JUMPER', value: 'pasoCorrienteJumper' },
    { label: 'Paso de Corriente CABLES', value: 'pasoCorrienteCables' },
    { label: 'Envío de Combustible', value: 'envioCombustible' },
    { label: 'Cambio de Llanta', value: 'cambioLlanta' },
    { label: 'Cerrajería', value: 'cerrajeria' },
    { label: 'Grúa', value: 'grua' }
  ];

  // Actualizar la definición de apiResponseData
  apiResponseData: ApiResponseData | ApiResponse[] = [];

  locationRequest: LocationRequest = {
    ubicacion: "",
    servicio: "envioCombustible",
    vehicle: "",
    latitud: 0,
    longitud: 0
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private boletasService: BoletasService
  ) {}

  ngOnInit(): void {
    // Verificar si hay un ID de boleta en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.boletaId = +params['id']; // Convertir a número
        this.cargarBoleta(this.boletaId);
      }
    });

    // Inicializar Google Maps
    this.inicializarMapa();
  }

  /**
   * Inicializa el mapa de Google Maps
   */
  inicializarMapa(): void {
    const loader = new Loader({
      apiKey: 'AIzaSyBAvfiixu6edXR8AejG4t4VyyypnYYxUOk',
    });

    loader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();

      // Crear el mapa con las coordenadas iniciales
      const mapElement = document.getElementById('map');
      if (mapElement) {
        this.map = new google.maps.Map(mapElement, {
          center: { lat: this.latitud, lng: this.longitud },
          zoom: 8,
          mapTypeControl: true,
        });

        // Crear un marcador arrastrable
        this.marker = new google.maps.Marker({
          position: { lat: this.latitud, lng: this.longitud },
          map: this.map,
          draggable: true,
        });

        // Actualizar las coordenadas cuando se arrastra el marcador
        if (this.marker) {
          this.marker.addListener('dragend', () => {
            const position = this.marker?.getPosition();
            if (position) {
              this.latitud = position.lat();
              this.longitud = position.lng();
              this.updateAddressFromCoordinates(this.latitud, this.longitud);
            }
          });
        }

        // Si ya tenemos una boleta cargada, actualizar el mapa con sus coordenadas
        if (this.boletaActual) {
          this.actualizarMapaConBoleta(this.boletaActual);
        }
      }
    });
  }

  /**
   * Actualiza el mapa con las coordenadas de la boleta
   */
  actualizarMapaConBoleta(boleta: Boleta): void {
    // Accedemos a las coordenadas de manera segura, ya que pueden estar en diferentes propiedades
    const lat = (boleta.direccion as any)?.latitud || (boleta.direccion as any)?.lat;
    const lng = (boleta.direccion as any)?.longitud || (boleta.direccion as any)?.lng;

    if (lat && lng) {
      this.latitud = parseFloat(lat);
      this.longitud = parseFloat(lng);

      console.log('Actualizando mapa con coordenadas:', this.latitud, this.longitud);

      // Actualizar el mapa cuando esté disponible
      if (this.map && this.marker) {
        const position = { lat: this.latitud, lng: this.longitud };

        // Centrar el mapa en la posición
        this.map.setCenter(position);
        this.map.setZoom(15); // Acercar el mapa para mejor visualización

        // Actualizar la posición del marcador
        this.marker.setPosition(position);

        // Asegurarse de que el marcador sea visible
        this.marker.setMap(this.map);

        // Añadir un pequeño retraso para asegurar que el mapa se renderice correctamente
        setTimeout(() => {
          if (this.map) {
            google.maps.event.trigger(this.map, 'resize');
          }
        }, 100);
      } else {
        // Si el mapa aún no está inicializado, esperar a que se inicialice
        console.log('Mapa no disponible, reintentando en 500ms...');
        setTimeout(() => {
          this.actualizarMapaConBoleta(boleta);
        }, 500);
      }
    } else {
      console.warn('No se encontraron coordenadas válidas en la boleta:', boleta);
    }
  }

  cargarBoleta(id: number): void {
    this.cargandoBoleta = true;
    this.boletasService.getBoleta(id).subscribe({
      next: (boleta) => {
        this.boletaActual = boleta;
        console.log('Boleta cargada:', boleta);

        // Inicializar datos del formulario con la información de la boleta
        if (boleta.direccion?.ubicacion) {
          this.direccion = boleta.direccion.ubicacion;
        }

        if (boleta.vehiculo) {
          this.vehiculo = `${boleta.vehiculo.marca} ${boleta.vehiculo.linea} ${boleta.vehiculo.modelo} - ${boleta.vehiculo.placa}`;
        }

        if (boleta.servicios && boleta.servicios.length > 0) {
          // Encontrar el servicio correspondiente en las opciones
          const servicio = boleta.servicios[0].tipo;
          const opcionServicio = this.serviceOptions.find(opt =>
            opt.label.toLowerCase().includes(servicio.toLowerCase()));

          if (opcionServicio) {
            this.serviceType = opcionServicio.value;
          }
        }

        // Actualizar el mapa con las coordenadas de la boleta
        this.actualizarMapaConBoleta(boleta);

        this.cargandoBoleta = false;
      },
      error: (error) => {
        console.error('Error al cargar la boleta:', error);
        this.cargandoBoleta = false;
      }
    });
  }

  buscarDireccion(): void {
    if (this.geocoder && this.map) {
      this.geocoder.geocode({ address: this.direccion }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          this.latitud = location.lat();
          this.longitud = location.lng();
          this.map?.setCenter(location);
          this.marker?.setPosition(location);

          // Update the location request with the new address and coordinates
          this.locationRequest.ubicacion = this.direccion;
          this.locationRequest.latitud = this.latitud;
          this.locationRequest.longitud = this.longitud;
        } else {
          alert('Dirección no encontrada');
        }
      });
    }
  }

  updateAddressFromCoordinates(lat: number, lng: number): void {
    if (this.geocoder) {
      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          this.direccion = results[0].formatted_address;
          this.locationRequest.ubicacion = this.direccion;
          this.locationRequest.latitud = lat;
          this.locationRequest.longitud = lng;
        }
      });
    }
  }

  confirmarDireccion(): void {
    if (!this.vehiculo) {
      alert('Por favor ingrese la información del vehículo');
      return;
    }

    this.activeStep = 2;
    this.isLoading = true;

    // Update the request data
    this.locationRequest = {
      ubicacion: this.direccion,
      servicio: this.serviceType,
      vehicle: this.vehiculo,
      latitud: this.latitud,
      longitud: this.longitud
    };

    // Call the API
    this.http.post<ApiResponse[]>('/api/better-routes', this.locationRequest)
      .subscribe({
        next: (response) => {
          this.apiResponseData = response;
          this.generateRoutesFromApiData();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching providers:', error);
          // Fallback to mock data in case of error
          this.generateRoutesFromApiData();
          this.isLoading = false;
          alert('Error al obtener proveedores. Usando datos de ejemplo.');
        }
      });
  }

  generateRoutesFromApiData(): void {
    // Verificar que apiResponseData tenga la estructura correcta
    if (!this.apiResponseData) {
      console.error('Error: apiResponseData es null o undefined', this.apiResponseData);
      // Usar datos de ejemplo si no hay datos válidos
      this.routeOptions = this.getMockRouteOptions();
      return;
    }

    // Si apiResponseData es un objeto con providerList
    if (!Array.isArray(this.apiResponseData) && this.apiResponseData.providerList) {
      console.log('apiResponseData es un objeto con providerList', this.apiResponseData);

      // Map the provider list to route options
      this.routeOptions = this.apiResponseData.providerList.map((apiProvider, index) => {
        // Determinar el tipo de servicio basado en el índice
        let serviceType = '';
        let colorClass = '';

        if (index === 0) {
          serviceType = 'Servicio Rápido';
          colorClass = 'green';
        } else if (index === 1) {
          serviceType = 'Asistencia Total';
          colorClass = 'yellow';
        } else {
          serviceType = 'Servicio Estándar';
          colorClass = 'red';
        }

        // Determinar el tráfico basado en el tiempo
        const trafficLevel = apiProvider.trafico ||
          (apiProvider.time.includes('10') ? 'Tráfico ligero' :
           apiProvider.time.includes('14') ? 'Tráfico moderado' : 'Tráfico pesado');

        // Crear la descripción
        const description = apiProvider.descripcion ||
          (index === 0 ? 'Ruta más rápida' :
           index === 1 ? 'Ruta alternativa' : 'Ruta con tráfico');

        return {
          name: apiProvider.proveedorName,
          duration: apiProvider.time,
          color: colorClass,
          distance: apiProvider.distance,
          description: description,
          toll: false,
          traffic: trafficLevel,
          icon: this.getServiceIcon(this.serviceType),
          serviceType: serviceType,
          provider: {
            name: apiProvider.proveedorName,
            address: apiProvider.direccion || 'Guatemala',
            distance: apiProvider.distance,
            phone: apiProvider.phoneNumber || '555-1234',
            rating: 4.5,
            openHours: '24/7',
            services: [this.serviceTypeLabel],
            time: apiProvider.time,
            serviceType: serviceType
          }
        };
      });
    }
    // Si apiResponseData es un array (formato antiguo)
    else if (Array.isArray(this.apiResponseData)) {
      console.log('apiResponseData es un array', this.apiResponseData);

      // Map the API response data to route options
      this.routeOptions = this.apiResponseData.map((apiProvider, index) => {
        // Determinar el tipo de servicio basado en el índice
        let serviceType = '';
        let colorClass = '';

        if (index === 0) {
          serviceType = 'Servicio Rápido';
          colorClass = 'green';
        } else if (index === 1) {
          serviceType = 'Asistencia Total';
          colorClass = 'yellow';
        } else {
          serviceType = 'Servicio Estándar';
          colorClass = 'red';
        }

        // Determinar el tráfico basado en el tiempo
        const trafficLevel = apiProvider.time.includes('10') ? 'Tráfico ligero' :
                            apiProvider.time.includes('14') ? 'Tráfico moderado' : 'Tráfico pesado';

        // Crear la descripción
        const description = index === 0 ? 'Ruta más rápida' :
                           index === 1 ? 'Ruta alternativa' : 'Ruta con tráfico';

        return {
          name: apiProvider.proveedorName,
          duration: apiProvider.time,
          color: colorClass,
          distance: apiProvider.distance,
          description: description,
          toll: false,
          traffic: trafficLevel,
          icon: this.getServiceIcon(this.serviceType),
          serviceType: serviceType,
          provider: {
            name: apiProvider.proveedorName,
            address: 'Guatemala',
            distance: apiProvider.distance,
            phone: '555-1234',
            rating: 4.5,
            openHours: '24/7',
            services: [this.serviceTypeLabel],
            time: apiProvider.time,
            serviceType: serviceType
          }
        };
      });
    }
    // Si no es ninguno de los formatos esperados
    else {
      console.error('Error: apiResponseData no tiene el formato esperado', this.apiResponseData);
      // Usar datos de ejemplo si no hay datos válidos
      this.routeOptions = this.getMockRouteOptions();
    }
  }

  getBackgroundColor(colorClass: string): string {
    switch (colorClass) {
      case 'green':
      case 'bg-green-100':
        return 'rgb(53,232,117)'; // Verde brillante
      case 'yellow':
      case 'bg-yellow-100':
        return 'rgb(232,220,92)'; // Amarillo
      case 'red':
      case 'bg-red-100':
        return 'rgb(239,87,87)'; // Rojo
      case 'bg-blue-100':
        return 'rgb(96,165,250)'; // Azul
      default:
        return 'rgb(229,231,235)'; // Gris claro
    }
  }

  selectRoute(route: RouteOption): void {
    this.selectedRoute = route;
    if (route.provider) {
      this.nearestProvider = route.provider;
    }
  }

  onServiceTypeChange(): void {
    this.locationRequest.servicio = this.serviceType;
    // In a real application, you might want to refresh the data based on the new service type
  }

  get serviceTypeLabel(): string {
    const option = this.serviceOptions.find(opt => opt.value === this.serviceType);
    return option ? option.label : '';
  }

  getServiceIcon(serviceType: string): string {
    switch (serviceType) {
      case 'pasoCorrienteJumper':
        return 'pi pi-bolt';
      case 'pasoCorrienteCables':
        return 'pi pi-power-off';
      case 'envioCombustible':
        return 'pi pi-fire';
      case 'cambioLlanta':
        return 'pi pi-circle';
      case 'cerrajeria':
        return 'pi pi-key';
      case 'grua':
        return 'pi pi-truck';
      default:
        return 'pi pi-wrench';
    }
  }

  /**
   * Genera opciones de ruta de ejemplo para usar como fallback
   */
  getMockRouteOptions(): RouteOption[] {
    return [
      {
        name: 'Servicio Rápido',
        duration: '15 min',
        color: 'green',
        distance: '3.2 km',
        description: 'La ruta más rápida para llegar al proveedor.',
        toll: false,
        traffic: 'Tráfico ligero',
        icon: 'fa-solid fa-bolt',
        serviceType: 'Servicio Rápido',
        provider: {
          name: 'Servicio Rápido',
          address: 'Zona 10, Ciudad de Guatemala',
          distance: '3.2 km',
          phone: '2222-1111',
          rating: 4.8,
          openHours: '24 horas',
          services: ['Grúa', 'Combustible', 'Mecánica'],
          time: '15 min',
          serviceType: 'Servicio Rápido'
        }
      },
      {
        name: 'Asistencia Total',
        duration: '22 min',
        color: 'yellow',
        distance: '4.5 km',
        description: 'Ruta alternativa con tiempo moderado.',
        toll: false,
        traffic: 'Tráfico moderado',
        icon: 'fa-solid fa-road',
        serviceType: 'Asistencia Total',
        provider: {
          name: 'Asistencia Total',
          address: 'Zona 14, Ciudad de Guatemala',
          distance: '4.5 km',
          phone: '2222-2222',
          rating: 4.5,
          openHours: '7:00 - 22:00',
          services: ['Grúa', 'Combustible'],
          time: '22 min',
          serviceType: 'Asistencia Total'
        }
      }
    ];
  }

  /**
   * Centra el mapa en la ubicación de la boleta actual
   */
  centrarEnUbicacion(): void {
    if (this.boletaActual) {
      this.actualizarMapaConBoleta(this.boletaActual);
    }
  }
}
