import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IFitacData } from "../models/IRequest";

export class TefiDB {
    private static api: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_URL_TEFI_DB
    });

    static async getFitac(roadmap: string): Promise<IFitacData[]> {
        try {
            const response: AxiosResponse<any> = await this.api.get(roadmap);
            return response.data ?? [];
        } catch (error) {
            console.error("Error al obtener datos:", error);
            return [];
        }
    }

    static async getPDF(id: string, idTemplate: string): Promise<Blob | undefined> {
        try {
            const response: AxiosResponse<Blob> = await this.api.get("/pdf", {
                params: { id, idTemplate },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener pdf:", error);
        }
    }

    static async getSignPDF(id: string, idTemplate: string, certificate: string, password: string): Promise<Blob> {
        try {
            const response: AxiosResponse<Blob> = await this.api.post("/pdf", {
                idFitac: id,
                idTemplate,
                passphrase: password,
                certificate
            }, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            throw error;
        }
    }
}
