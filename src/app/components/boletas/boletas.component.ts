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
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface RouteOption {
  name: string;
  duration: string;
  color: string;
  distance: string;
  description: string;
  toll: boolean;
  traffic: string;
  icon: string;
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
}

interface ApiResponse {
  proveedorName: string;
  time: string;
  distance: string;
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
    HttpClientModule
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
  
  serviceOptions = [
    { label: 'Paso de Corriente JUMPER', value: 'pasoCorrienteJumper' },
    { label: 'Paso de Corriente CABLES', value: 'pasoCorrienteCables' },
    { label: 'Envío de Combustible', value: 'envioCombustible' },
    { label: 'Cambio de Llanta', value: 'cambioLlanta' },
    { label: 'Cerrajería', value: 'cerrajeria' },
    { label: 'Grúa', value: 'grua' }
  ];

  // Mock API response data for fallback
  apiResponseData: ApiResponse[] = [
    {
        "proveedorName": "Grúas Don Chepe",
        "time": "0 horas 10 minutos",
        "distance": "3.98km"
    },
    {
        "proveedorName": "Grúas Rodas",
        "time": "0 horas 14 minutos",
        "distance": "9.74km"
    },
    {
        "proveedorName": "Grúas Andree",
        "time": "0 horas 25 minutos",
        "distance": "9.86km"
    }
  ];

  locationRequest: LocationRequest = {
    ubicacion: "",
    servicio: "envioCombustible",
    vehicle: "",
    latitud: 0,
    longitud: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const loader = new Loader({
      apiKey: 'AIzaSyBAvfiixu6edXR8AejG4t4VyyypnYYxUOk',
    });
    loader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: { lat: this.latitud, lng: this.longitud },
        zoom: 8,
      });
      this.marker = new google.maps.Marker({
        position: { lat: this.latitud, lng: this.longitud },
        map: this.map,
        draggable: true,
      });

      // Add event listener for marker drag end
      if (this.marker) {
        google.maps.event.addListener(this.marker, 'dragend', () => {
          const position = this.marker?.getPosition();
          if (position) {
            this.latitud = position.lat();
            this.longitud = position.lng();
            this.updateAddressFromCoordinates(this.latitud, this.longitud);
          }
        });
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
    // Map the API response data to route options
    this.routeOptions = this.apiResponseData.map((apiProvider, index) => {
      let routeColor: string;
      let routeIcon: string;
      let routeDescription: string;
      let routeTraffic: string;
      
      // Assign different properties based on the index/time
      if (index === 0) {
        routeColor = 'bg-green-100';
        routeIcon = 'pi pi-bolt';
        routeDescription = 'La ruta más rápida para llegar al proveedor.';
        routeTraffic = 'Ligero';
      } else if (index === 1) {
        routeColor = 'bg-yellow-100';
        routeIcon = 'pi pi-map-marker';
        routeDescription = 'Ruta alternativa con tiempo moderado.';
        routeTraffic = 'Moderado';
      } else {
        routeColor = 'bg-red-100';
        routeIcon = 'pi pi-clock';
        routeDescription = 'Ruta más larga para llegar al proveedor.';
        routeTraffic = 'Bajo';
      }
      
      return {
        name: `Opción ${index + 1}`,
        duration: apiProvider.time,
        color: routeColor,
        distance: apiProvider.distance,
        description: routeDescription,
        toll: false,
        traffic: routeTraffic,
        icon: routeIcon,
        provider: {
          name: apiProvider.proveedorName,
          distance: apiProvider.distance,
          time: apiProvider.time,
          // Add default values for other provider properties
          phone: '+502 ' + Math.floor(1000000 + Math.random() * 9000000),
          rating: Number((3 + Math.random() * 2).toFixed(1)),
          openHours: 'Lun-Vie: 8:00 - 18:00, Sáb: 8:00 - 13:00',
          services: ['Envío de combustible', 'Asistencia en carretera', 'Servicio 24/7']
        }
      };
    });
    
    // Auto-select the first route if available
    if (this.routeOptions.length > 0) {
      this.selectRoute(this.routeOptions[0]);
    }
  }

  getBackgroundColor(colorClass: string): string {
    switch (colorClass) {
      case 'bg-green-100':
        return 'rgb(53,232,117)';
      case 'bg-yellow-100':
        return 'rgb(232,220,92)';
      case 'bg-red-100':
        return 'rgb(239,87,87)';
      default:
        return 'white';
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
}
