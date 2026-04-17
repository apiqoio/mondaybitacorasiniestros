// Campos disponibles en la API externa de siniestros (Make webhook)
// Agrupados por categoría para mejor UX en el mapeo
export const API_FIELD_GROUPS = [
  {
    group: 'Siniestro',
    fields: [
      { key: 'Siniestro',          label: 'Número de Siniestro' },
      { key: 'n_reporte',          label: 'Número de Reporte' },
      { key: 'Fec_Ocurrencia',     label: 'Fecha de Ocurrencia' },
      { key: 'Fec_Reporte',        label: 'Fecha de Reporte' },
      { key: 'Descripcion_Hechos', label: 'Descripción de Hechos' },
      { key: 'Tipo_De_Atencion',   label: 'Tipo de Atención' },
      { key: 'Ubicacion_Rec',      label: 'Ubicación de Recepción' },
    ],
  },
  {
    group: 'Asegurado',
    fields: [
      { key: 'Nombre_Del_Asegurado',               label: 'Nombre del Asegurado' },
      { key: 'Telefono_Contacto',                   label: 'Teléfono de Contacto' },
      { key: 'Nombre_Del_Conductor_En_El_Crucero',  label: 'Nombre del Conductor' },
    ],
  },
  {
    group: 'Póliza',
    fields: [
      { key: 'poliza',        label: 'Póliza' },
      { key: 'Oficina',       label: 'Oficina' },
      { key: 'Ramo',          label: 'Ramo' },
      { key: 'Cobertura',     label: 'Cobertura' },
      { key: 'Estado_Poliza', label: 'Estado de la Póliza' },
      { key: 'Grupo',         label: 'Grupo' },
    ],
  },
  {
    group: 'Vehículo',
    fields: [
      { key: 'Tipo_De_Vehiculo',   label: 'Tipo de Vehículo' },
      { key: 'Marca',              label: 'Marca / Descripción' },
      { key: 'Modelo_En_La_Poliza', label: 'Modelo (Año)' },
      { key: 'Serie_En_La_Poliza', label: 'Número de Serie' },
    ],
  },
  {
    group: 'Ajustador',
    fields: [
      { key: 'Nombre_De_Ajustador',   label: 'Nombre del Ajustador' },
      { key: 'Despacho',              label: 'Despacho' },
      { key: 'Asignacion_Ajustador',  label: 'Asignación del Ajustador' },
      { key: 'Arribo_Ajustador',      label: 'Arribo del Ajustador' },
      { key: 'Termino_Atencion',      label: 'Término de Atención' },
    ],
  },
  {
    group: 'Tiempos',
    fields: [
      { key: 'Toma_Llamada',        label: 'Toma de Llamada' },
      { key: 'Tiempo_En_Asignar',   label: 'Tiempo en Asignar' },
      { key: 'Tiempo_En_Arribo',    label: 'Tiempo en Arribo' },
      { key: 'Tiempo_Pend_Reserva', label: 'Tiempo Pendiente Reserva' },
      { key: 'Tiempo_En_Termino',   label: 'Tiempo en Término' },
    ],
  },
  {
    group: 'Ubicación',
    fields: [
      { key: 'Regional',              label: 'Regional' },
      { key: 'Delegacion_Municipio',  label: 'Delegación / Municipio' },
      { key: 'Entidad',               label: 'Entidad' },
      { key: 'Latitud',               label: 'Latitud' },
      { key: 'Longitud',              label: 'Longitud' },
    ],
  },
  {
    group: 'Terceros',
    fields: [
      { key: 'Existe_Tercero',                      label: 'Existe Tercero' },
      { key: 'Compania',                            label: 'Compañía' },
      { key: 'Compania_Seguro_Tercero_2',           label: 'Compañía Seguro Tercero' },
      { key: 'Subrogacion_Entregamos_Recibimos',    label: 'Subrogación' },
    ],
  },
  {
    group: 'Otros',
    fields: [
      { key: 'Filenet',                             label: 'FileNet' },
      { key: 'aaapertu',                            label: 'Año de Apertura' },
      { key: 'Monto_De_Recuperacion_En_Cruzero',    label: 'Monto de Recuperación' },
      { key: 'Tipo_De_Orden',                       label: 'Tipo de Orden' },
      { key: 'Reporte_Legal_IKE',                   label: 'Reporte Legal IKE' },
      { key: 'Proviene_Edua',                       label: 'Proviene EDUA' },
    ],
  },
] as const;

// Lista plana de todos los campos para usar en dropdowns
export const API_FIELDS = API_FIELD_GROUPS.flatMap((g) =>
  g.fields.map((f) => ({ ...f, group: g.group })),
);

export type ApiFieldKey = (typeof API_FIELD_GROUPS)[number]['fields'][number]['key'];

// Respuesta de la API externa (Make webhook) — campos tal como los devuelve
export interface SiniestroApiResponse {
  [key: string]: string | number | undefined;
  Regional?: string;
  Delegacion_Municipio?: string;
  Entidad?: string;
  Nombre_De_Ajustador?: string;
  Despacho?: string;
  Oficina?: string;
  Ramo?: string;
  Siniestro?: string;
  poliza?: string;
  n_reporte?: string;
  Cobertura?: string;
  Estado_Poliza?: string;
  Fec_Ocurrencia?: string;
  Fec_Reporte?: string;
  aaapertu?: string;
  Toma_Llamada?: string;
  Asignacion_Ajustador?: string;
  Arribo_Ajustador?: string;
  Termino_Atencion?: string;
  Tiempo_En_Asignar?: string;
  Tiempo_En_Arribo?: string;
  Tiempo_Pend_Reserva?: string;
  Tiempo_En_Termino?: string;
  Tipo_De_Atencion?: string;
  Ubicacion_Rec?: string;
  Monto_De_Recuperacion_En_Cruzero?: string;
  Existe_Tercero?: string;
  Subrogacion_Entregamos_Recibimos?: string;
  Tipo_De_Orden?: string;
  Compania?: string;
  Compania_Seguro_Tercero_2?: string;
  Reporte_Legal_IKE?: string;
  Descripcion_Hechos?: string;
  Grupo?: string;
  Nombre_Del_Conductor_En_El_Crucero?: string;
  Nombre_Del_Asegurado?: string;
  Telefono_Contacto?: string;
  Tipo_De_Vehiculo?: string;
  Serie_En_La_Poliza?: string;
  Modelo_En_La_Poliza?: string;
  Marca?: string;
  Latitud?: string;
  Longitud?: string;
  Proviene_Edua?: string;
  Filenet?: string;
}

// Una entrada del mapeo: campo de la API → columna de Monday
export interface MappingEntry {
  apiField: string;
  columnId: string;
  columnTitle: string;
  columnType: string;   // 'text' | 'numbers' | 'date' | 'status' | ...
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
  oficina?: string;
  ramo?: string;
  poliza?: string;
  numeroSiniestro?: string;
  filenet?: string;
}
