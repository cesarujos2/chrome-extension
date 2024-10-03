import axios, { AxiosInstance, AxiosResponse } from "axios";


export class TefiDB {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_URL_TEFI_DB
        });
    }

    async getFitac(roadmap: string): Promise<any[]> {
        try {
            const response: AxiosResponse<any> = await this.api.get(roadmap);
            return response.data ?? [];
        } catch (error) {
            console.error("Error al obtener datos:", error);
            return [];
        }
    }

    async getPDF(id: string, idTemplate: string) {

        try {
            const response: AxiosResponse<any> = await this.api.get("/pdf", {
                params: {
                    id: id,
                    idTemplate: idTemplate
                },
                responseType: 'blob'
            })
            const blob = response.data
            return blob

        } catch (error) {
            console.error("Error al obtener pdf:", error);
        }
    }

    async getSignPDF(id: string, idTemplate: string, certificate: string, password: string) {
        try {

            const response: AxiosResponse<Blob> = await this.api.post("/pdf", {
                idFitac: id,
                idTemplate: idTemplate,
                passphrase: password,
                certificate: certificate
            }, {
                responseType: 'blob'
            });

            const blob = response.data
            return blob

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            throw error; 
        }
    }
}
