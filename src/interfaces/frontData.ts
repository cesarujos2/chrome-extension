export interface Request {
    action: string
    data?: any;
    nextScript?: string
}

export interface IFitac {
  document_name: string;
  id: string;
  status_id: string;
  tipo_expediente_c: string;
  nro_doc_identificacion_c: string;
  first_name: string;
  last_name: string;
  nameProyect: string;
  emails_concat: string;
}