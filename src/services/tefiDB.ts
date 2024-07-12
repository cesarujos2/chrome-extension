import axios from "axios"

export async function queryTefiDB(query: string) {
    const response = await axios.post(import.meta.env.VITE_URL_TEFI_DB, {
        query
    })
    return response.data
}