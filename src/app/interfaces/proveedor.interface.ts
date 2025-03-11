export interface ProveedoresResponse {
  vehicleData: VehiculoData;
  providerList: Proveedor[];
  ubicacion?: string;
  servicio?: string;
}

export interface VehiculoData {
  modelo: string;
  anio: number;
  dimensiones: Dimensiones;
  peso: string;
  tipo_grua: string;
}

export interface Dimensiones {
  longitud: string;
  ancho: string;
  altura: string;
  distancia_entre_ejes: string;
}

export interface Proveedor {
  proveedorName: string;
  time: string;
  distance: string;
  phoneNumber: string;
  direccion: string;
  department: string;
  distanceLimit: string;
  descripcion?: string;
  trafico?: string;
}

// Nueva interfaz para manejar la respuesta actual de la API
export interface ApiResponse {
  incidents: any[];
  success: boolean;
}
