export interface ProveedoresResponse {
  vehicleData: VehiculoData;
  providerList: Proveedor[];
}

export interface VehiculoData {
  modelo: string;
  año: number;
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
}
