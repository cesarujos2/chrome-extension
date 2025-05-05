import { createRequest } from "../utils/createRequestContent";
import { copyText } from "./copyText";
import { guardarEnLocalStorage, obtenerDeLocalStorage } from "./localStorageHandler";
import { ModalOverlay } from "./ModalOverlay";

export function modifyTable() {
    const table = document.querySelector("table.list.view.table-responsive");

    if (!table) {
        console.log("No se encontró la tabla.");
        return;
    }

    // Encuentra los encabezados de la tabla para identificar columnas
    const headers = Array.from(table.querySelectorAll("th"));
    const colIndex = {
        documentName: headers.findIndex(th => th.textContent?.trim() === "Hoja de Ruta"),
        columnInforme: headers.findIndex(th => th.textContent?.trim() === "N° Informe Resolutivo" ||
            th.textContent?.trim() === "Fecha Informe resolutivo"),
        nroOficio: headers.findIndex(th => th.textContent?.trim() === "N° Oficio Resolutivo"),
        status: headers.findIndex(th => th.textContent?.trim() === "Estado Resolutivo")
    };

    if (Object.values(colIndex).some(index => index === -1)) {
        console.log("No se encontraron todas las columnas necesarias.");
        return;
    }

    // Iterar sobre las filas de la tabla
    const tbody = table.querySelector(':scope > tbody')
    tbody?.querySelectorAll("tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length != headers.length) return;

        const documentName = cells[colIndex.documentName]?.innerText.trim();
        const columnInforme = cells[colIndex.columnInforme]?.innerText.trim();
        const nroOficio = cells[colIndex.nroOficio]?.innerText.trim();
        const status = cells[colIndex.status]?.innerText.trim();

        if (!columnInforme && status && status != "por_evaluar" && status != "") {
            const button = document.createElement("button");
            button.style.padding = "6px 12px";
            button.style.cursor = "pointer";
            button.style.border = "none";
            button.style.borderRadius = "8px";
            button.style.minWidth = "95px"
            button.style.textAlign = "center";
            button.style.color = "white";
            button.style.fontSize = "14px";
            button.style.fontWeight = "500";
            button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
            button.style.transition = "background-color 0.3s ease, transform 0.1s ease";

            let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsInformeGenerated") ?? [];
            if (roadmapsGenerated.includes(documentName)) {
                button.textContent = "Generado";
                button.style.backgroundColor = "#3f3f46";
                button.style.color = "#fff";
            } else {
                button.textContent = "Generar";
                button.style.backgroundColor = "#fff";
                button.style.color = "#232323";
            }

            button.onmouseover = () => {
                button.style.filter = "brightness(90%)";
            };

            button.onmouseout = () => {
                button.style.filter = "brightness(100%)";
            };

            button.onmousedown = () => {
                button.style.transform = "scale(0.98)";
            };

            button.onmouseup = () => {
                button.style.transform = "scale(1)";
            };

            button.onclick = async (e: Event) => {
                e.preventDefault();
                ModalOverlay.showModal("Ejecutando Generación de Informe...");
                await copyText(documentName);

                //Buscar oficio
                const request = createRequest()
                request.action = "searchRoadMap"
                request.content.fitacData.document_name = documentName
                request.content.isOffice = false
                chrome.runtime.sendMessage(request);

                button.style.backgroundColor = "#3f3f46";
                button.style.color = "#fff";
                button.textContent = "Generar";

                let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsInformeGenerated") ?? [];
                guardarEnLocalStorage("roadmapsInformeGenerated", [...roadmapsGenerated, documentName]);
            };


            cells[colIndex.columnInforme].innerHTML = "";
            cells[colIndex.columnInforme].appendChild(button);
        }

        if (!nroOficio && columnInforme) {
            const button = document.createElement("button");
            button.style.padding = "6px 12px";
            button.style.cursor = "pointer";
            button.style.border = "none";
            button.style.borderRadius = "8px";
            button.style.minWidth = "95px"
            button.style.textAlign = "center";
            button.style.color = "white";
            button.style.fontSize = "14px";
            button.style.fontWeight = "500";
            button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
            button.style.transition = "background-color 0.3s ease, transform 0.1s ease";

            let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsOfficeGenerated") ?? [];
            if (roadmapsGenerated.includes(documentName)) {
                button.textContent = "Generado";
                button.style.backgroundColor = "#3f3f46";
                button.style.color = "#fff";
            } else {
                button.textContent = "Generar";
                button.style.backgroundColor = "#fff";
                button.style.color = "#232323";
            }

            button.onmouseover = () => {
                button.style.filter = "brightness(90%)";
            };

            button.onmouseout = () => {
                button.style.filter = "brightness(100%)";
            };

            button.onmousedown = () => {
                button.style.transform = "scale(0.98)";
            };

            button.onmouseup = () => {
                button.style.transform = "scale(1)";
            };

            button.onclick = async (e: Event) => {
                e.preventDefault();
                ModalOverlay.showModal("Ejecutando generación de Oficio...");
                await copyText(documentName)

                const request = createRequest()
                request.action = "searchRoadMap"
                request.content.fitacData.document_name = documentName
                request.content.isOffice = true
                chrome.runtime.sendMessage(request);

                button.style.backgroundColor = "#3f3f46";
                button.style.color = "#fff";
                button.textContent = "Generado";

                let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsOfficeGenerated") ?? [];
                guardarEnLocalStorage("roadmapsOfficeGenerated", [...roadmapsGenerated, documentName]);
            };


            cells[colIndex.nroOficio].innerHTML = "";
            cells[colIndex.nroOficio].appendChild(button);
        }
    });
}