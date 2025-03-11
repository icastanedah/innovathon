import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Proveedor } from '../../interfaces/proveedor.interface';

@Component({
  selector: 'app-confirmacion-proveedor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Confirmación de Proveedor</h2>
          <button
            (click)="volver()"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
          >
            Volver
          </button>
        </div>

        <div *ngIf="proveedor" class="mb-6 p-4 bg-green-50 rounded-md">
          <h3 class="text-lg font-semibold mb-4 text-green-700">Proveedor seleccionado correctamente</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium">Nombre:</p>
              <p class="text-gray-700">{{ proveedor.proveedorName }}</p>
            </div>
            <div>
              <p class="font-medium">Teléfono:</p>
              <p class="text-gray-700">{{ proveedor.phoneNumber }}</p>
            </div>
            <div>
              <p class="font-medium">Tiempo estimado:</p>
              <p class="text-gray-700">{{ proveedor.time }}</p>
            </div>
            <div>
              <p class="font-medium">Distancia:</p>
              <p class="text-gray-700">{{ proveedor.distance }}</p>
            </div>
            <div>
              <p class="font-medium">Dirección:</p>
              <p class="text-gray-700">{{ proveedor.direccion }}</p>
            </div>
            <div>
              <p class="font-medium">Departamento:</p>
              <p class="text-gray-700">{{ proveedor.department }}</p>
            </div>
          </div>

          <div class="mt-6">
            <p class="text-gray-700">
              <span class="font-medium">Información del servicio:</span>
              El proveedor ha sido notificado y se dirigirá a la ubicación del incidente.
              Recibirá una notificación cuando el proveedor esté en camino.
            </p>
          </div>

          <div class="mt-6 flex justify-center">
            <button
              (click)="finalizarProceso()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Finalizar
            </button>
          </div>
        </div>

        <div *ngIf="!proveedor" class="bg-yellow-50 p-4 rounded-md text-center">
          <p class="text-yellow-700">No se ha seleccionado ningún proveedor. Por favor, regrese a la pantalla anterior.</p>
        </div>
      </div>
    </div>
  `
})
export class ConfirmacionProveedorComponent implements OnInit {
  proveedor: Proveedor | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recuperar los datos del proveedor del state de la navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.proveedor = navigation.extras.state['proveedor'];
    }
  }

  volver(): void {
    this.router.navigate(['/proveedores']);
  }

  finalizarProceso(): void {
    // Aquí se podría implementar lógica adicional como guardar en base de datos
    // o enviar una confirmación al backend

    // Redirigir a la pantalla principal
    this.router.navigate(['/notificaciones']);
  }
}
