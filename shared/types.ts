// Campos disponibles en la API externa de siniestros
export const API_FIELDS = [
  { key: 'nombreAsegurado',    label: 'Nombre del Asegurado' },
  { key: 'nombreConductor',    label: 'Nombre del Conductor' },
  { key: 'poliza',             label: 'Póliza' },
  { key: 'placas',             label: 'Placas' },
  { key: 'vehiculo',           label: 'Vehículo' },
  { key: 'serie',              label: 'Serie' },
  { key: 'telefonoContacto',   label: 'Teléfono de Contacto' },
  { key: 'fechaSiniestro',     label: 'Fecha del Siniestro' },
  { key: 'oficina',            label: 'Oficina' },
  { key: 'ramo',               label: 'Ramo' },
  { key: 'cobertura',          label: 'Cobertura' },
  { key: 'estadoPoliza',       label: 'Estado de la Póliza' },
  { key: 'filenet',            label: 'Filenet' },
  { key: 'grupo',              label: 'Grupo' },
  { key: 'descripcionHechos',  label: 'Descripción de los Hechos' },
] as const;

export type ApiFieldKey = typeof API_FIELDS[number]['key'];

// Respuesta de la API externa
export interface SiniestroApiResponse {
  numeroSiniestro: string;
  nombreAsegurado: string;
  nombreConductor: string;
  poliza: string;
  placas: string;
  vehiculo: string;
  serie: string;
  telefonoContacto: string;
  fechaSiniestro: string;   // 'YYYY-MM-DD'
  oficina: string;
  ramo: string;
  cobertura: string;
  estadoPoliza: string;
  filenet: string;
  grupo: string;
  descripcionHechos: string;
}

// Una entrada del mapeo: campo de la API → columna de Monday
export interface MappingEntry {
  apiField: ApiFieldKey;
  columnId: string;
  columnTitle: string;
  columnType: string;   // 'text' | 'numbers' | 'date' | 'status' | ...
}

// Configuración completa de mapeo guardada en Monday Storage
export interface MappingConfig {
  mappings: MappingEntry[];
}

// Payload que el backend retorna al frontend
export interface SiniestroResult {
  data: SiniestroApiResponse;
}

// Error estandarizado
export interface ApiError {
  error: string;
  details?: unknown;
}

// Modos de búsqueda disponibles
export type SearchMode = 'poliza' | 'siniestro' | 'filenet';

// Parámetros de búsqueda para consultar la API
export interface SearchParams {
  mode: SearchMode;
  // Modo poliza (todos obligatorios)
  oficina?: string;
  ramo?: string;
  poliza?: string;
  // Modo siniestro
  numeroSiniestro?: string;
  // Modo filenet
  filenet?: string;
}
