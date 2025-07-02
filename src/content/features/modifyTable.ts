import { createRequest } from "../utils/createRequestContent";
import { csvToJson } from "../utils/csvToJson";
import { sendMessageAsync } from "../utils/sendMessageAsync";
import { isNullOrWhiteSpace } from "./isNullOrWhiteSpace";
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

                const request = createRequest();

                // Verificar si se seleccionó la opción de seleccionar todos los documentos
                var isDisabledCheckbox = (document.getElementById("massall_top") as HTMLInputElement)?.disabled;

                if (isDisabledCheckbox) {
                    const data = await getAllOfficeDataTable();
                    if (!data || data.length === 0) {
                        ModalOverlay.showModal("No se encontraron datos para generar el oficio. Esta opción solo aplica a fichas del SRFITAC.");
                        return;
                    }

                    const filterData = data.filter(item => {
                        const hr = item['Hoja de Ruta'];
                        const oficioLink = item['Link Oficio Resolutivo'];
                        const reportLink = item['URL Informe resolutivo'];
                        return !isNullOrWhiteSpace(hr)
                            && (isNullOrWhiteSpace(oficioLink) || !isValidUrlVisorSTD(oficioLink))
                            && !isNullOrWhiteSpace(reportLink)
                            && isValidUrlVisorSTD(reportLink);
                    }).map(item => item['Hoja de Ruta']) as string[];

                    request.content.documents = filterData;
                } else {
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

                }

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


export const getAllOfficeDataTable = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    const currentPost = {
        module: "Fitac_fitac",
        action: "index",
        searchFormTab: "advanced_search",
        estado_atencion_c_advanced: ["pendiente"],
        status_id_advanced: [
            "completa",
            "incompleta",
            "amerita_evap",
            "duplicada",
            "improcedente",
            "aprobado",
            "desaprobado",
            "observado"
        ],
        created_by_advanced: ["32e63148-96e6-277b-925b-666b06726444"], // Id del Usuario del sistema de fichas
        search_module: "Fitac_fitac"
    };

    urlencoded.append("current_post", JSON.stringify(currentPost));

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow" as RequestRedirect
    };

    try {
        const response = await fetch("https://dgprc.atm-erp.com/dgprc/index.php?entryPoint=export&module=Fitac_fitac", requestOptions);
        const result = await response.text();
        const data = csvToJson(result);
        return data as FitacTefiData[];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function isValidUrlVisorSTD(url?: string): boolean {
    if (!url) return false;
    const regex = /^https:\/\/visorstd\.mtc\.gob\.pe\/viewer\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(url);
}


interface FitacTefiData {
    first_name: string;
    last_name?: string;
    ID?: string;
    salutation?: string;
    title?: string;
    department?: string;
    email_address?: string;
    email_addresses_non_primary?: string;
    phone_mobile?: string;
    phone_work?: string;
    phone_home?: string;
    phone_other?: string;
    phone_fax?: string;
    'Calle de dirección principal'?: string;
    'Ciudad de dirección principal'?: string;
    'Estado/Provincia de dirección principal'?: string;
    'CP de dirección principal'?: string;
    'País de dirección principal'?: string;
    alt_address_street?: string;
    alt_address_city?: string;
    alt_address_state?: string;
    alt_address_postalcode?: string;
    alt_address_country?: string;
    'Descripción'?: string;
    do_not_call?: string;
    assistant?: string;
    assistant_phone?: string;
    'Asignado a'?: string;
    'Id de usuario asignado'?: string;
    'Fecha de Creación'?: string;
    'Fecha de Modificación'?: string;
    'Modificado Por'?: string;
    'Creado por'?: string;
    Eliminado?: string;
    photo?: string;
    lawful_basis?: string;
    date_reviewed?: string;
    lawful_basis_source?: string;
    'Hoja de Ruta'?: string;
    'Nombre de Archivo'?: string;
    'Extensión de Archivo'?: string;
    'Tipo MIME'?: string;
    'Publish Date'?: string;
    'Fecha de Caducidad'?: string;
    'Categoría'?: string;
    'Subcategoría'?: string;
    'Estado Resolutivo'?: string;
    'Medidas Prevención'?: string;
    ' Mitigación y/o Control'?: string;
    'Mecanismo de Participación Cuidadana'?: string;
    'Cronograma de Ejecución'?: string;
    'DJ Rni + DJ No Seia'?: string;
    contact_id_c?: string;
    proy_proyectostele_id_c?: string;
    'Principales Recursos'?: string;
    'Foto Montaje'?: string;
    'N° Oficio Resolutivo'?: string;
    'Link Fitac'?: string;
    'Enlace Oficio Abandono'?: string;
    'Fecha Ingreso'?: string;
    '7.	Se indica la fecha de inicio de obras (día'?: string;
    ' mes'?: string;
    ' año).'?: string;
    'Número de solicitud'?: string;
    '5.	Se menciona el nombre del proyecto a ejecutar.'?: string;
    'Hoja Ruta Inicial'?: string;
    '2.	Se incluye la información del domicilio legal del Titular.'?: string;
    '15. Cuenta con la firma del representante legal del titular'?: string;
    ' asiento'?: string;
    ' partida registral y la oficina registral'?: string;
    ' donde se encuentra registrado.'?: string;
    'Fecha Oficio Abandono'?: string;
    'N° Informe Resolutivo'?: string;
    'Con Copia'?: string;
    '14.	Presenta Declaración Jurada de proyecto no sujeto al Sistema Nacional de Evaluación de Impacto Ambiental (SEIA).'?: string;
    'Fecha Acuse Oficio'?: string;
    'Fecha Oficio Resolutivo'?: string;
    'Nro Oficio Abandono'?: string;
    '4.	Se incluye el correo electrónico del representante legal del Titular.'?: string;
    'Link medidas contingencia'?: string;
    'Fecha Informe resolutivo'?: string;
    'Tipo Expediente'?: string;
    'Link medidas ambientales'?: string;
    'Link Oficio Resolutivo'?: string;
    '1.	Se incluyen todos los datos generales del Titular (nombres o razón social'?: string;
    ' DNI'?: string;
    ' RUC'?: string;
    ' entre otros).'?: string;
    'copia muni (relacionado Administrado ID)'?: string;
    '8.	Se presenta el presupuesto estimado para implementar las medidas de control ambiental en cada etapa del proyecto (instalación'?: string;
    ' operación'?: string;
    ' cierre).'?: string;
    '3.	Se incluyen los teléfonos de contacto del Titular.'?: string;
    'Nro Informe Abandono'?: string;
    'Consultor Ambiental (relacionado Administrado ID)'?: string;
    'HR Ampliación'?: string;
    '12.	Se presenta el cronograma ejecución del proyecto por cada etapa (instalación'?: string;
    ' operación y cierre).'?: string;
    '10.	Se ha descrito los principales recursos o materiales para la etapa de instalación del proyecto [SOLO FICHA ANTIGUA]'?: string;
    'Enlace Informe Abandono'?: string;
    'Notificación'?: string;
    '13.	Presenta Declaración Jurada de cumplimiento relacionado a la RNI.'?: string;
    'URL Informe resolutivo'?: string;
    'ID FTA Doc. Alfresco'?: string;
    '17. Se menciona el objetivo'?: string;
    ' zonificación y vida útil del proyecto a ejecutar.'?: string;
    'Estado de Atención'?: string;
    '9.	Se ha descrito el tipo de infraestructura de telecomunicaciones (Poste'?: string;
    ' Rooftop'?: string;
    ' Greenfield u otros) de acuerdo a lo solicitado.'?: string;
    'Fecha Informe Abandono'?: string;
    'Notificación Abandono'?: string;
    'Informe Resolutivo Id'?: string;
    'Parráfo variable'?: string;
    'DJ RNI'?: string;
    '18. Se presentan las medidas de contingencia para los riesgos identificados en el proyecto.'?: string;
    'Tipo Proyecto'?: string;
    '6.	Se precisa la ubicación exacta del proyecto (ubicación geográfica'?: string;
    ' incluyendo coordenadas UTM DATUM WGS84'?: string;
}