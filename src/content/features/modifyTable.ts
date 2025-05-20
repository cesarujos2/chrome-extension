import { createRequest } from "../utils/createRequestContent";
import { sendMessageAsync } from "../utils/sendMessageAsync";
import { ModalOverlay } from "./ModalOverlay";

export async function modifyTable() {
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
    tbody?.querySelectorAll("tr").forEach(async row => {
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

            const request = createRequest()
            request.action = "getRoadmapsGenerated"
            request.content.isOffice = false
            let roadmapsGenerated = await sendMessageAsync<string[]>(request);

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

                //Buscar oficio
                const request = createRequest()
                request.action = "searchRoadMap"
                request.content.documents = [documentName]
                request.content.isOffice = false
                chrome.runtime.sendMessage(request);

                button.style.backgroundColor = "rgb(95 95 95)";
                button.style.color = "#fff";
                button.textContent = "Clickado";
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
            button.textContent = "Generar";

            const request = createRequest()
            request.action = "getRoadmapsGenerated"
            request.content.isOffice = true
            let roadmapsGenerated = await sendMessageAsync<string[]>(request);
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

                const request = createRequest()
                request.action = "searchRoadMap"
                request.content.documents = [documentName]
                request.content.isOffice = true
                chrome.runtime.sendMessage(request);

                button.style.backgroundColor = "rgb(95 95 95)";
                button.style.color = "#fff";
                button.textContent = "Clickado";
            };


            cells[colIndex.nroOficio].innerHTML = "";
            cells[colIndex.nroOficio].appendChild(button);
        }
    });


    const rowsActions = [':scope > thead', ':scope > tfoot'];
    const rowActionsButtons = rowsActions.map(selector => table.querySelector(selector)?.querySelector("tbody")?.querySelector(".paginationActionButtons")).filter(Boolean) as HTMLTableRowElement[];
    //const rowActionsButton = table.querySelector(':scope > thead')?.querySelector("tbody")?.querySelector(".paginationActionButtons") as HTMLTableRowElement;

    if (rowActionsButtons && rowActionsButtons.length > 0) {
        const crearInformeMasivoBoton = () => {
            const informeMasivoBoton = document.createElement('li');
            const informeMasivoBotonLink = document.createElement('a');
            informeMasivoBotonLink.textContent = 'Generar Informe';
            informeMasivoBoton.appendChild(informeMasivoBotonLink);

            informeMasivoBotonLink.onclick = async (e: Event) => {
                e.preventDefault();

                const request = createRequest()
                tbody?.querySelectorAll("tr").forEach(row => {
                    const cells = row.querySelectorAll("td");
                    const checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
                    const documentName = cells[colIndex.documentName]?.innerText.trim();
                    const columnInforme = cells[colIndex.columnInforme]?.innerText.trim();
                    const status = cells[colIndex.status]?.innerText.trim();

                    if (checkbox && checkbox.checked && (!columnInforme || columnInforme == "Generar") && status && status != "por_evaluar" && status != "") {
                        request.content.documents.push(documentName)

                    }
                })

                if (request.content.documents.length == 0) {
                    ModalOverlay.showModal("No se seleccionó ningún documento para generar el informe.");
                    return;
                }

                request.action = "searchRoadMap"
                request.content.isOffice = false
                chrome.runtime.sendMessage(request);
            }

            return informeMasivoBoton;
        }

        const crearOfficeMasivoBoton = () => {
            const officeMasivoBoton = document.createElement('li');
            const officeMasivoBotonLink = document.createElement('a');
            officeMasivoBotonLink.textContent = 'Generar Oficio';
            officeMasivoBoton.appendChild(officeMasivoBotonLink);

            officeMasivoBotonLink.onclick = async (e: Event) => {
                e.preventDefault();

                const request = createRequest()
                tbody?.querySelectorAll("tr").forEach(row => {
                    const cells = row.querySelectorAll("td");
                    const checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
                    const documentName = cells[colIndex.documentName]?.innerText.trim();
                    const columnInforme = cells[colIndex.columnInforme]?.innerText.trim();
                    const nroOficio = cells[colIndex.nroOficio]?.innerText.trim();

                    if (checkbox && checkbox.checked && (!nroOficio || nroOficio == "Generar") && columnInforme && columnInforme != "" 
                    && columnInforme != "Generar" && columnInforme != "Generado" && columnInforme != "Clickado") {
                        request.content.documents.push(documentName)
                    }
                })

                if (request.content.documents.length == 0) {
                    ModalOverlay.showModal("No se seleccionó ningún documento para generar el oficio.");
                    return;
                }

                request.action = "searchRoadMap"
                request.content.isOffice = true
                chrome.runtime.sendMessage(request);
            }
            return officeMasivoBoton;
        }

        const actionsMasivoBoton = rowActionsButtons.map(row => row.querySelector("[id^='actionLink']")?.querySelector("ul")) as HTMLUListElement[];
        actionsMasivoBoton.forEach(row => {
            row.appendChild(crearInformeMasivoBoton());
            row.appendChild(crearOfficeMasivoBoton());
        });
    }
}
