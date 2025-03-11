export interface ApiResponse {
  incidents: Incidente[];
  success: boolean;
}

export interface Incidente {
  images: ImagenIncidente[];
  incident_id: string;
  incident_info: IncidenteInfo;
  insurance_info: SeguroInfo;
  location: UbicacionInfo;
  status: string;
  status_updated_at: string;
  timestamp: string;
  vehicle_info: VehiculoInfo;
}

export interface ImagenIncidente {
  type: string;
  url: string;
}

export interface IncidenteInfo {
  damage_type: string;
  date: string;
  description: string;
  severity: string;
}

export interface SeguroInfo {
  card_number: string;
  expiration_date: string;
  holder_name: string;
  policy_number: string;
}

export interface UbicacionInfo {
  address: string;
  latitude: number;
  longitude: number;
  reference: string;
}

export interface VehiculoInfo {
  color: string;
  make: string;
  model: string;
  plate: string;
  year: string;
}

// Mantenemos la interfaz original para compatibilidad con el código existente
export interface NotificacionIncidente {
  incident?: {
    incident_type?: string;
    damage_severity?: string;
    vehicle_type?: string;
    damaged_parts?: string[];
    confidence?: number;
    description?: string;
  };
  vehicle?: {
    placa?: string;
    nombre_propietario?: string;
    marca?: string;
    modelo?: string;
    año?: string;
    color?: string;
    tipo?: string;
  };
  location?: {
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    address?: string;
    city?: string;
    country?: string;
  };
  timestamp?: string;
  status?: string;
}
