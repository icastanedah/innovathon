export interface Boleta {
  id: number;
  numero: string;
  fecha: Date;
  estado: EstadoBoleta;
  tipo: TipoBoleta;
  telefonos: string[];
  siniestro: DatosSiniestro;
  vehiculo: DatosVehiculo;
  asegurado: DatosAsegurado;
  reclamo: DatosReclamo;
  observaciones: string[];
  servicios: Servicio[];
  direccion: DireccionSiniestro;
  tiempos: TiemposBoleta;
  costos: CostosBoleta;
  proveedor: DatosProveedor;
}

export interface DatosSiniestro {
  tipo: string;
  nombreReportante: string;
  nombrePiloto: string;
  descripcion: string;
  numeroAtencion?: string;
  terceroCulpable: boolean;
  compromisoPago: boolean;
}

export interface DatosVehiculo {
  marca: string;
  linea: string;
  color: string;
  placa: string;
  modelo: string;
  tipo: string;
  licencia?: string;
}

export interface DatosAsegurado {
  numeroPoliza: string;
  titular: string;
  intermediario: string;
  tipoCliente: string;
}

export interface DatosReclamo {
  numero?: string;
  analista?: string;
}

export interface DireccionSiniestro {
  ubicacion: string;
  zona: string;
  calleAvenida: string;
  numeroCasa?: string;
  referencia?: string;
}

export interface Servicio {
  id: number;
  tipo: string;
  estado: string;
  fechaAsignacion?: Date;
}

export enum EstadoBoleta {
  ACTIVO = 'Activo',
  PENDIENTE = 'Pendiente',
  COMPLETADO = 'Completado',
  CANCELADO = 'Cancelado'
}

export enum TipoBoleta {
  SEGUROS = 'Seguros G&T',
  ASISTENCIA = 'Asistencia Vial',
  RECLAMO = 'Reclamo'
}

export interface BoletaFiltros {
  fechaInicio?: Date;
  fechaFin?: Date;
  nombreCliente?: string;
  operador?: string;
  estado?: string;
  tipoSiniestro?: string;
  servicio?: string;
  origenBoleta?: string;
  despachador?: string;
}

export interface BoletaListado {
  id: number;
  numero: string;
  piloto: string;
  reportante: string;
  poliza: string;
  direccion: string;
  estado: string;
  tipoSiniestro: string;
  origen: string;
  tipoBoleta: string;
}

export interface TiemposBoleta {
  horaDespacho: Date;
  horaLlegada?: Date;
  horaFinalizacion?: Date;
  tiempoDespacho: string;
  tiempoLlegada: string;
  tiempoAtencion: string;
  tiempoEstimado?: string;
}

export interface CostosBoleta {
  servicio: string;
  unidades: number;
  kmTerracerias: number;
  kmRecorrido: number;
  kmVacio: number;
  costoManiobra: number;
  costoEspera: number;
  tarifaBase: number;
  tarifaKmTerracerias: number;
  tarifaKmRecorrido: number;
  tarifaKmVacio: number;
}

export interface DatosProveedor {
  nombre: string;
  telefonos: string[];
  tipo: string;
  base: string;
} 