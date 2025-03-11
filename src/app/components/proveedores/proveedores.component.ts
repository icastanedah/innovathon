import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedoresService } from '../../services/proveedores.service';
import { ProveedoresResponse, Proveedor } from '../../interfaces/proveedor.interface';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedores.component.html'
})
export class ProveedoresComponent implements OnInit {
  proveedoresResponse: ProveedoresResponse | null = null;
  proveedores: Proveedor[] = [];
  vehiculoInfo: string = '';
  cargando: boolean = true;
  error: string = '';
  incidenteId: string = '';
  ubicacion: { latitud: number, longitud: number } = { latitud: 0, longitud: 0 };
  tipoServicio: string = '';
  direccion: string = '';

  constructor(
    private proveedoresService: ProveedoresService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.incidenteId = params['incidentId'] || '';

      // Parsear la ubicación que viene como "latitud,longitud"
      const locationParts = (params['location'] || '0,0').split(',');
      this.ubicacion.latitud = parseFloat(locationParts[0] || '0');
      this.ubicacion.longitud = parseFloat(locationParts[1] || '0');

      this.tipoServicio = params['tipoServicio'] || 'grua';
      this.direccion = params['direccion'] || '';

      console.log('Parámetros recibidos:', {
        incidenteId: this.incidenteId,
        ubicacion: this.ubicacion,
        tipoServicio: this.tipoServicio,
        direccion: this.direccion
      });

      if (this.incidenteId && (this.ubicacion.latitud !== 0 || this.ubicacion.longitud !== 0)) {
        this.buscarProveedores();
      } else {
        this.cargando = false;
        this.error = 'Faltan parámetros necesarios para buscar proveedores.';
      }
    });
  }

  /**
   * Busca proveedores cercanos para el incidente
   */
  buscarProveedores(): void {
    this.cargando = true;
    this.error = '';

    console.log('Buscando proveedores con:', {
      incidenteId: this.incidenteId,
      ubicacion: this.ubicacion,
      tipoServicio: this.tipoServicio
    });

    this.proveedoresService.buscarProveedores(
      this.incidenteId,
      this.ubicacion,
      this.tipoServicio
    ).subscribe({
      next: (response) => {
        console.log('Respuesta recibida:', response);
        this.proveedoresResponse = response;
        this.proveedores = response.providerList || [];

        if (response.vehicleData) {
          this.vehiculoInfo = `${response.vehicleData.modelo} (${response.vehicleData.año})`;
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al buscar proveedores:', err);
        this.error = 'Error al buscar proveedores. Por favor, inténtelo de nuevo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Selecciona un proveedor y navega a la pantalla de confirmación
   * @param proveedor El proveedor seleccionado
   */
  seleccionarProveedor(proveedor: Proveedor): void {
    // Navegar a la pantalla de confirmación con los datos del proveedor
    this.router.navigate(['/confirmacion-proveedor'], {
      state: { proveedor }
    });
  }

  /**
   * Vuelve a la pantalla anterior
   */
  volver(): void {
    this.router.navigate(['/notificaciones']);
  }
}
