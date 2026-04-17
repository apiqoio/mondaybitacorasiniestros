import type { MappingEntry } from '@shared/types';

// Mapeo default compartido por todos los usuarios del tablero Bitacora Movilidad (board 7136569683).
// Los campos con columnId vacío quedan sin emparejar — rellenar manualmente cuando se identifique la columna correcta.
// Generado a partir del consumo real: https://hook.us1.make.com/t6fplu28pqd8n2nrwbx5ch6ublebcyg2?siniestro=507
export const DEFAULT_MAPPING: MappingEntry[] = [
  // Siniestro
  { apiField: 'Siniestro',          columnId: 'siniestro__1',               columnTitle: 'SINIESTRO',                        columnType: 'numbers' },
  { apiField: 'n_reporte',          columnId: 'text_mm2gg94z',              columnTitle: 'Reporte',                          columnType: 'text' },
  { apiField: 'Fec_Ocurrencia',     columnId: 'fecha__1',                   columnTitle: 'FECHA',                            columnType: 'date' },
  { apiField: 'Fec_Reporte',        columnId: 'date_mm2gy63k',              columnTitle: 'Fecha del reporte',                columnType: 'date' },
  { apiField: 'Descripcion_Hechos', columnId: 'text3__1',                   columnTitle: 'Descripción de Los Hechos',        columnType: 'text' },
  { apiField: 'Tipo_De_Atencion',   columnId: 'color__1',                   columnTitle: 'Tipo de Atencíon (Motivo de Llamada )', columnType: 'status' },
  { apiField: 'Ubicacion_Rec',      columnId: 'color67__1',                 columnTitle: 'Atención Local o Carretero',       columnType: 'status' },

  // Asegurado
  { apiField: 'Nombre_Del_Asegurado',              columnId: 'nombre_del_asegurado__1', columnTitle: 'Nombre del Asegurado',  columnType: 'text' },
  { apiField: 'Telefono_Contacto',                 columnId: 'telefono_de_contacto__1', columnTitle: 'Telefono de contacto',  columnType: 'text' },
  { apiField: 'Nombre_Del_Conductor_En_El_Crucero', columnId: 'nombre_de_conductor__1', columnTitle: 'Nombre de Conductor',    columnType: 'text' },

  // Póliza
  { apiField: 'poliza',        columnId: 'p_liza__1',              columnTitle: 'PÓLIZA',              columnType: 'text' },
  { apiField: 'Oficina',       columnId: 'oficina__1',             columnTitle: 'OFICINA',             columnType: 'numbers' },
  { apiField: 'Ramo',          columnId: 'ramo__1',                columnTitle: 'RAMO',                columnType: 'numbers' },
  { apiField: 'Cobertura',     columnId: 'cobertura__1',           columnTitle: 'COBERTURA',           columnType: 'status' },
  { apiField: 'Estado_Poliza', columnId: 'estado_de_la_poliza__1', columnTitle: 'ESTADO DE LA POLIZA', columnType: 'status' },
  { apiField: 'Grupo',         columnId: 'grupo__1',               columnTitle: 'GRUPO',               columnType: 'text' },

  // Vehículo
  { apiField: 'Tipo_De_Vehiculo',   columnId: 'text_mm2g5s3d', columnTitle: 'Tipo Vehículo', columnType: 'text' },
  { apiField: 'Marca',              columnId: 'veh_culo__1',   columnTitle: 'Vehículo', columnType: 'text' },
  { apiField: 'Modelo_En_La_Poliza', columnId: 'modelo__1',    columnTitle: 'Modelo',   columnType: 'numbers' },
  { apiField: 'Serie_En_La_Poliza', columnId: 'serie__1',      columnTitle: 'Serie',    columnType: 'text' },

  // Ajustador
  { apiField: 'Nombre_De_Ajustador',  columnId: 'ajustador__1',                 columnTitle: 'AJUSTADOR',                         columnType: 'status' },
  { apiField: 'Despacho',             columnId: 'despacho__1',                  columnTitle: 'Despacho',                          columnType: 'status' },
  { apiField: 'Asignacion_Ajustador', columnId: 'asignaci_n_de_ajustador__1',   columnTitle: 'Asignación de Ajustador',           columnType: 'text' },
  { apiField: 'Arribo_Ajustador',     columnId: 'arribo_de_ajustador__1',       columnTitle: 'Arribo de ajustador',               columnType: 'text' },
  { apiField: 'Termino_Atencion',     columnId: 'text__1',                      columnTitle: 'Termino de atención de ajustador',  columnType: 'text' },

  // Tiempos
  { apiField: 'Toma_Llamada',        columnId: 'toma_de_llamada__1', columnTitle: 'Toma de Llamada',                                      columnType: 'text' },
  { apiField: 'Tiempo_En_Asignar',   columnId: 'text7__1',           columnTitle: 'Tiempo Toma de Llamada - Asignación de Ajustador',     columnType: 'text' },
  { apiField: 'Tiempo_En_Arribo',    columnId: 'text1__1',           columnTitle: 'Tiempo Toma de Llamada - Arribo de Ajustador',         columnType: 'text' },
  { apiField: 'Tiempo_Pend_Reserva', columnId: 'text_mm2gv73w',      columnTitle: 'Tiempo Pendiente de Reserva',                          columnType: 'text' },
  { apiField: 'Tiempo_En_Termino',   columnId: 'text6__1',           columnTitle: 'Tiempo Toma de llmada - Termino de la Atención',       columnType: 'text' },

  // Ubicación
  { apiField: 'Regional',             columnId: 'regional__1',                columnTitle: 'REGIONAL',               columnType: 'status' },
  { apiField: 'Delegacion_Municipio', columnId: 'delegaci_n_o_municipio__1',  columnTitle: 'Delegación o Municipio', columnType: 'status' },
  { apiField: 'Entidad',              columnId: 'entidad__1',                 columnTitle: 'Entidad',                columnType: 'status' },
  { apiField: 'Latitud',              columnId: 'text_mm2gmgph',              columnTitle: 'Latitud',                columnType: 'text' },
  { apiField: 'Longitud',             columnId: 'text_mm2g2x1s',              columnTitle: 'Longitud',               columnType: 'text' },

  // Terceros
  { apiField: 'Existe_Tercero',                   columnId: '', columnTitle: '', columnType: '' },
  { apiField: 'Compania',                         columnId: '', columnTitle: '', columnType: '' },
  { apiField: 'Compania_Seguro_Tercero_2',        columnId: '', columnTitle: '', columnType: '' },
  { apiField: 'Subrogacion_Entregamos_Recibimos', columnId: '', columnTitle: '', columnType: '' },

  // Otros
  { apiField: 'Filenet',                          columnId: 'filenet__1', columnTitle: 'FILENET', columnType: 'text' },
  { apiField: 'aaapertu',                         columnId: 'text_mm2gy8v5',           columnTitle: 'Apertura',        columnType: 'text' },
  { apiField: 'Monto_De_Recuperacion_En_Cruzero', columnId: 'text_mm2gnysk',           columnTitle: 'Monto_De_Recuperacion_En_Cruzero',        columnType: 'text' },
  { apiField: 'Tipo_De_Orden',                    columnId: 'text_mm2gyn5g',           columnTitle: 'Tipo_De_Orden',        columnType: 'text' },
  { apiField: 'Reporte_Legal_IKE',                columnId: 'text_mm2gz56m',           columnTitle: 'Reporte_Legal_IKE',        columnType: 'text' },
  { apiField: 'Proviene_Edua',                    columnId: 'text_mm2g3mn',           columnTitle: 'Proviene_Edua',        columnType: 'text' },
];

// Mapeos efectivos (con columna emparejada) — los que realmente se escriben al tablero.
export const ACTIVE_MAPPINGS: MappingEntry[] = DEFAULT_MAPPING.filter(
  (m) => m.columnId && m.columnType,
);
