export function guardarEnLocalStorage<T>(clave: string, objeto: T): void {
    try {
        const objetoString = JSON.stringify(objeto);
        localStorage.setItem(clave, objetoString);
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
    }
}

export function obtenerDeLocalStorage<T>(clave: string): T | null {
    try {
        const objetoString = localStorage.getItem(clave);
        return objetoString ? JSON.parse(objetoString) : null;
    } catch (error) {
        console.error("Error al obtener datos de localStorage:", error);
        return null;
    }
}