import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';

interface RouteOption {
  name: string;
  duration: string;
  color: string;
  distance: string;
  description: string;
  toll: boolean;
  traffic: string;
  icon: string;
}

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, CommonModule, StepperModule, CardModule],
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
        } else {
          alert('Dirección no encontrada');
        }
      });
    }
  }

  confirmarDireccion(): void {
    this.activeStep = 2;
    this.routeOptions = [
      {
        name: 'Ruta Rápida',
        duration: '30 min',
        color: 'bg-green-100',
        distance: '5 km',
        description: 'La ruta más rápida, ideal para llegar sin demoras.',
        toll: false,
        traffic: 'Ligero',
        icon: 'pi pi-bolt',
      },
      {
        name: 'Ruta Normal',
        duration: '45 min',
        color: 'bg-yellow-100',
        distance: '7 km',
        description: 'Ruta estándar con tráfico moderado.',
        toll: true,
        traffic: 'Moderado',
        icon: 'pi pi-map-marker',
      },
      {
        name: 'Ruta Lenta',
        duration: '60 min',
        color: 'bg-red-100',
        distance: '10 km',
        description: 'Ruta más larga, pero con menos tráfico.',
        toll: false,
        traffic: 'Bajo',
        icon: 'pi pi-clock',
      },
    ];
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
}
