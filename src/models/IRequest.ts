export interface IRequest {
    action: string;
    content: {
        documents: string[];
        index: number;
        fitacData: Partial<IFitacData>;
        docBase64: string;
        fileName: string;
        isOffice: boolean;
        usedDragAndDrop: boolean;
    };
    nextScript?: string;
    delay?: number;
    config: {
        theme: string;
        signLegal: boolean;
    }
}

export interface IFitacData {
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