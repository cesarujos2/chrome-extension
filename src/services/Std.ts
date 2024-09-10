import axios, { AxiosInstance, AxiosResponse } from "axios";

export class STD {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_URL_TEFI_DB
        });
    }

    async getPDF(roadmap: string) {

        try {
            const response: AxiosResponse<any> = await this.api.get("/std/anexo", {
                params: {
                    roadmap: roadmap,
                },
                responseType: 'blob'
            })
            const blob = response.data
            return blob

        } catch (error) {
            console.error("Error al obtener pdf:", error);
        }
    }
}