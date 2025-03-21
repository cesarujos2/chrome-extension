import { Request } from "../interfaces/frontData";

chrome.runtime.onMessage.addListener(function (request: Request) {
    if (request.action === 'loadRoadMap') {
        const fromLogin = document.getElementById('frmLogin') as HTMLFormElement
        if (!fromLogin) {
            const roadmap = request.data.document_name
            if (roadmap.length > 0) {
                const inputHRSTD = document.getElementById('idformbusq:idhrbuscar') as HTMLInputElement
                const buttonBuscarSTD = document.getElementById('idformbusq:btnBuscarHojaDeRuta')
                const anio = document.getElementById('idformbusq:idanioexpediente_input') as HTMLInputElement
                if (inputHRSTD && buttonBuscarSTD && anio) {
                    inputHRSTD.value = roadmap.split("-")[1];
                    anio.value = roadmap.split("-")[2]
                    buttonBuscarSTD.click();
                    chrome.runtime.sendMessage({ action: "waiting", nextScript: "isRepeatRoadMap" });
                }
            }
        }
    }
    if (request.action === 'isRepeatRoadMap') {
        let divPrincipal = document.getElementById("formvistahojaderuta:tabview");
        const listaUl = divPrincipal?.querySelector("div")?.querySelector("div")?.querySelector("div")?.querySelector("div");
        if (!listaUl) {
            let tableListHR = document.getElementById("formvistahojaderuta:tabview:datosVista_data")?.children;
            if (tableListHR) {
                for (let i = 0; i < tableListHR.length; i++) {
                    if (tableListHR[i].children[7].textContent?.split("-")[0] == "E") {
                        tableListHR[i].querySelectorAll("a")[0].click();
                        chrome.runtime.sendMessage({ action: "waiting", nextScript: "clickOnGenerateDocument" });
                        break
                    }
                }
            }
        } else {
            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "isPosibleToDerive" });
        }
    }

    if (request.action === 'isPosibleToDerive') {
        const table = document.getElementById("formvistahojaderuta:tabview:movimientos")?.querySelector("table");

        if (table) {
            const rows = table.querySelectorAll("tr");

            for (const row of rows) {
                const cells = row.querySelectorAll("td");
                if (cells.length > 0) {
                    const lastCell = cells[cells.length - 1];
                    if (lastCell?.textContent?.trim().toUpperCase() === "VISAR") {
                        showModal("Ya ha sido derivado, ¿desea proceder a derivar igualmente?", 8000, () =>{
                            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "clickOnGenerateDocument" });
                        })
                        return;
                    }
                }
            }
            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "clickOnGenerateDocument" });
        }
    }

    if (request.action === 'clickOnGenerateDocument') {
        let divPrincipal = document.getElementById("formvistahojaderuta:tabview");
        const listaUl = divPrincipal?.querySelector("div")?.querySelector("div")?.querySelectorAll("div")[0].querySelector("div");

        if (listaUl) {
            let encontrado = false
            for (let i = 0; i < listaUl.children.length; i++) {
                if (listaUl.children[i].textContent == "Generar doc. electronico") {
                    encontrado = true;
                    if (!request.data.options.onlySearch) {
                        let liGenerarDoc = listaUl.children[i];
                        const enlace = liGenerarDoc as HTMLAnchorElement;
                        enlace.click()
                        setTimeout(() => {
                            let numAdmin = document.getElementById('frmSelecctNumeracion:btnNumAdm') as HTMLButtonElement
                            numAdmin.click()
                            chrome.runtime.sendMessage({ action: "waiting", nextScript: "removeResponsible" });
                        }, 1000)
                    }
                    break
                }
            }
            if (!encontrado) {
                showModal("No se puede derivar")
            }
        }
    }
    if (request.action === 'removeResponsible') {
        // showModal("Cargando informacion...")
        let firmantes = document.getElementById("idproyectonuevo:idtabla_visadores_readonly_data") as any
        firmantes?.children[0].children[7].children[0].click()
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "typeOfDocument", data: { delay: 200 } });
    }

    if (request.action === 'typeOfDocument') {
        let typeDoc = document.getElementById("idproyectonuevo:iddocumentos_label") as HTMLLabelElement
        typeDoc.click()

        const documentTypes = Array.from(document.getElementById("idproyectonuevo:iddocumentos_items")?.children || [])
        let ofType = documentTypes.find((item) => item.textContent?.trim().toLowerCase() === "oficio") as HTMLLIElement
        ofType.click()

        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addSubject", data: { delay: 200 } });
    }
    if (request.action === 'addSubject') {
        let asunto = document.getElementById("idproyectonuevo:idAsCP") as HTMLTextAreaElement
        document.getElementById("idproyectonuevo:btnDespachar")?.click()
        asunto.textContent = ''
        if (request.data.tipo_expediente_c == 'desestimiento') {
            asunto.textContent = `Solicitud de desistimiento de la Ficha Técnica para Proyectos de Infraestructura de Telecomunicaciones que NO están sujetos al Sistema Nacional de Evaluación de Impacto Ambiental (SEIA) del proyecto ${request.data.nameProyect}`
        } else {
            switch (request.data.status_id) {
                case 'aprobado':
                case 'desaprobado':
                case 'observado':
                    asunto.textContent = `Remite resultado de verificación de la Ficha Técnica Ambiental presentada para el proyecto de infraestructura de telecomunicaciones que no está sujeto al Sistema Nacional de Evaluación de Impacto Ambiental - SEIA`
                    break;
                case 'duplicada':
                case 'improcedente':
                    asunto.textContent = `Verificación de la Ficha Técnica presentada para el proyecto de Infraestructura de Telecomunicaciones denominado "${request.data.nameProyect}" que no está sujeto al Sistema Nacional de Evaluación de Impacto Ambiental (SEIA)`
                    break;
            }
        }
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addOrganicUnit", data: { delay: 200 } });
    }

    if (request.action === 'addOrganicUnit') {
        let openUO = document.getElementById("idproyectonuevo:seccionBuscarFirmante")?.querySelector("button")
        if (openUO) {
            openUO.click()
            delayScript(800, () => {
                let inputUO = document.getElementById("myDialogUO")?.querySelectorAll("input")[1]
                if (inputUO) {
                    inputUO.value = '26'
                    inputUO.dispatchEvent(new Event('keyup', {
                        bubbles: true,
                        cancelable: true,
                    }));
                }
                delayScript(900, () => {
                    let check26 = document.getElementById("myDialogUO")?.querySelector("table")?.querySelector("tbody")?.querySelector("tr")?.querySelector("input")
                    let aceptarUO = document.getElementById("myDialogUO")?.querySelector("form")?.querySelector("a")
                    let addFirm = document.getElementById("idproyectonuevo:seccionAddFirmante")?.querySelector("button")
                    if (check26 && aceptarUO && addFirm) { check26.click(); aceptarUO.click(); addFirm.click() }
                    chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addVisador", data: { delay: 200 } });
                })
            })
        }
    }

    if (request.action === 'addVisador') {
        document.getElementById("idproyectonuevo:seccionBotonesVisador")?.querySelectorAll("button")[1].click()
        delayScript(900, () => {
            document.getElementById("myDialogVisadores")?.querySelector("table")?.querySelector("tbody")?.querySelectorAll("tr")[1].querySelector("input")?.click()
            delayScript(200, () => {
                getUserByName(getBoss() ?? 'VICTOR ORLANDO');
                delayScript(300, () => {
                    chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "mayNeedUODestination" });
                })
            })
        })
    }

    if (request.action === 'mayNeedUODestination') {
        if (request.data.status_id == 'desaprobado') {
            const buttonOpenDestination = document.getElementById("idproyectonuevo:seccionElegirDestinatarios")?.getElementsByTagName("button")[0] as HTMLButtonElement
            if (buttonOpenDestination) buttonOpenDestination.click()
            delayScript(500, () => {
                let inputUO = document.getElementById("dlgform_uo")?.querySelectorAll("input")[2]
                if (inputUO) {
                    inputUO.value = '29';
                    inputUO.dispatchEvent(new Event('keyup', {
                        bubbles: true,
                        cancelable: true,
                    }));
                }
                delayScript(800, async () => {

                    const getRowUO = async (rowUODestination: HTMLTableRowElement, intentos: number = 0): Promise<HTMLTableRowElement> => {
                        if (intentos > 10) throw new Error("No se encontró la UO destino después de varios intentos.");
                        if (rowUODestination?.children[2]?.textContent?.trim() == '29') return rowUODestination;
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                rowUODestination = document.getElementById("dlgform_uo")?.querySelectorAll("table")[0].children[1].children[0] as HTMLTableRowElement
                                resolve(getRowUO(rowUODestination, intentos + 1));
                            }, 1000);
                        })
                    }
                    let rowUODestination = document.getElementById("dlgform_uo")?.querySelectorAll("table")[0].children[1].children[0] as HTMLTableRowElement
                    rowUODestination = await getRowUO(rowUODestination)

                    let checkUODestination = rowUODestination?.children[1].querySelector("span") as HTMLSpanElement

                    if (checkUODestination) {
                        checkUODestination.click()
                        delayScript(200, () => {
                            document.getElementById("dlgform_uo")?.querySelectorAll("button")[0].click()
                            delayScript(200, () => {
                                chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "selectAdministered" });
                            })
                        })
                    }
                })
            })
        } else {
            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "selectAdministered" });
        }
    }

    if (request.action === 'selectAdministered') {
        document.getElementById("idproyectonuevo:tipoUo_label")?.click()
        delayScript(200, () => {
            const itemsDestination = Array.from(document.getElementById("idproyectonuevo:tipoUo_panel")?.getElementsByTagName("li") ?? [])

            for (const item of itemsDestination) {
                if (item.textContent?.includes('PERSONA JURIDICA')) {
                    item.click()
                    break;
                }
            }
            delayScript(200, () => {
                const buttonOpenDestination = document.getElementById("idproyectonuevo:seccionElegirDestinatarios")?.getElementsByTagName("button")[0] as HTMLButtonElement
                if (buttonOpenDestination) buttonOpenDestination.click()
                delayScript(500, () => {
                    const inputsJuridica = document.getElementById("dlg_ruc")?.querySelectorAll("input")
                    const textareaJuridica = document.getElementById("dlg_ruc")?.querySelector("textarea")
                    if (inputsJuridica && inputsJuridica[1] && inputsJuridica[7] && textareaJuridica) {
                        console.log(request.data)
                        inputsJuridica[1].value = request.data.nro_doc_identificacion_c;
                        inputsJuridica[7].value = request.data.first_name + ' ' + request.data.last_name;
                        textareaJuridica.textContent = `El administrado autorizó notificación vía correo electrónico a los siguientes correos: ${request.data.emails_concat}`;
                        const buttons = document.getElementById("dlg_ruc")?.querySelectorAll("button")
                        if (buttons && buttons[1] && buttons[0]) {
                            buttons[1].click()
                            delayScript(1000, () => {
                                buttons[0].click()
                                delayScript(100, () => {
                                    document.getElementById("idproyectonuevo:seccionBotones")?.querySelector("button")?.click()
                                    if (!request.data.options.noDownload) {
                                        delayScript(500, () => {
                                            chrome.runtime.sendMessage({ action: "getDocumentFitac" });
                                            chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "generarDocumento", data: { delay: 800 } });
                                        })
                                    }
                                })
                            })
                        }

                    }
                })
            })
        })
    }
    if (request.action === 'generarDocumento') {
        document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button")[1]?.click();
        findElementWithRetry("idproyectonuevo:linkShowUploadPdf", () => {
            document.getElementById("idproyectonuevo:linkShowUploadPdf")?.click();
            findElementWithRetry("idproyectonuevo:seccionDocFirmado", () => {
                document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button")[3]?.click()
            }, 100, 1000);
        }, 15, 1000);
    }

    if (request.action === "modifyTable") {
        modifyTable()
    }

    if (request.action === "downloadFitacNew") {
        showModal("Descargando documento...");
        const base64 = request.data.base64;
        const fileName = request.data.fileName;

        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binaryString = atob(data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        closeModal();
    }
})

function getUserByName(name: string, otros: boolean = false, cancelable: boolean = false) {
    let usersList = document.getElementById("myDialogVisadores")?.querySelectorAll("table")[1].querySelector("tbody")?.querySelectorAll("tr")
    if (usersList && usersList.length > 0) {
        const users = Array.from(usersList)
        let userFilered = users.filter(x => x.textContent?.toUpperCase().includes(name))[0]
        if (userFilered) {
            userFilered.children[1].getElementsByTagName("input")[0].click()
            if (!otros) {
                delayScript(100, () => {
                    let aceptarUO = document.getElementById("myDialogVisadores")?.querySelector("form")?.querySelector("a")
                    if (aceptarUO) aceptarUO.click()
                })
            }
        } else if (!cancelable) {
            const navigator = document.getElementById("myDialogVisadores")?.querySelectorAll("table")[1].parentElement?.parentElement?.getElementsByTagName("a")
            if (navigator && navigator.length > 2) {
                navigator[2].click()
                delayScript(200, () => {
                    getUserByName(name, otros, true)
                    if (otros) {
                        navigator[0].click()
                    }
                })
            }
        }
    }
}

function getBoss(): string | null {
    const bannerTop = document.getElementById("top");
    if (!bannerTop) {
        return null;
    }

    const textContent = bannerTop.textContent;
    if (!textContent) {
        return null;
    }

    const jefeKeyword = "Jefe(a):";
    const startIndex = textContent.indexOf(jefeKeyword);
    if (startIndex === -1) {
        return null;
    }

    const endIndex = textContent.indexOf("\n", startIndex + jefeKeyword.length);
    if (endIndex === -1) {
        return null;
    }

    const jefe = textContent.substring(startIndex + jefeKeyword.length, endIndex).trim();
    return jefe;
}

let modalOverlay: HTMLDivElement | null = null;

function showModal(message: string, timeClose?: number, callback?: () => void) {
    if (modalOverlay) return; // Evita múltiples modales abiertos

    modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '9999';
    modalOverlay.style.backdropFilter = 'blur(6px)'; // Efecto de desenfoque

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1E1E2E'; // Color oscuro elegante
    modalContent.style.color = '#F8F8F2';
    modalContent.style.padding = '24px';
    modalContent.style.borderRadius = '12px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '380px';
    modalContent.style.textAlign = 'center';
    modalContent.style.fontSize = '14px';
    modalContent.style.fontWeight = '600';
    modalContent.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)';
    modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);

    modalContent.textContent = message;

    if (callback) {
        const button = document.createElement('button');
        button.textContent = 'Aceptar';
        button.style.marginTop = '16px';
        button.style.padding = '10px 16px';
        button.style.backgroundColor = '#4F46E5';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.transition = 'background-color 0.3s ease, transform 0.1s ease';
        
        button.onmouseover = () => {
            button.style.backgroundColor = '#4338CA';
        };
        
        button.onmouseout = () => {
            button.style.backgroundColor = '#4F46E5';
        };

        button.onmousedown = () => {
            button.style.transform = 'scale(0.95)';
        };

        button.onmouseup = () => {
            button.style.transform = 'scale(1)';
        };

        button.addEventListener('click', () => {
            closeModal(); 
            callback();
        });

        modalContent.appendChild(document.createElement('br'));
        modalContent.appendChild(button);
    }

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    if (timeClose) {
        setTimeout(closeModal, timeClose);
    }
}


function closeModal() {
    if (modalOverlay) {
        modalOverlay.remove();
        modalOverlay = null;
    }
}

async function delayScript(delay: number, callback: () => Promise<void> | void) {
    await new Promise(resolve => setTimeout(resolve, delay));
    await callback();
}

function copiarFecha() {
    let divPrincipal = document.getElementById("formvistahojaderuta:tabview");
    let datetoCopy = divPrincipal?.querySelectorAll("table")[1].querySelectorAll("tr")[0].querySelectorAll("td")[1].textContent?.trim().split(" ")[0]
    if (!datetoCopy) return
    copyText(datetoCopy)
}

function copyText(textToCopy: string) {
    navigator.clipboard.writeText(textToCopy);

}

// @ts-ignore
function findElementWithRetry(
    elementId: string, // El id del elemento a buscar
    callback: (element: HTMLElement) => void, // El callback a ejecutar si se encuentra el elemento
    maxRetries: number = 10, // Número máximo de intentos
    interval: number = 500 // Intervalo entre intentos en milisegundos
): void {
    let attempts = 0;

    const tryFindElement = () => {
        const element = document.getElementById(elementId);

        if (element) {
            callback(element as HTMLElement);
        } else {
            attempts++;
            if (attempts < maxRetries) {
                console.log(`Intento ${attempts} de ${maxRetries} para encontrar el elemento con id ${elementId}.`);
                setTimeout(tryFindElement, interval);
            } else {
                console.warn(`No se encontró el elemento con id ${elementId} después de ${maxRetries} intentos.`);
            }
        }
    };

    tryFindElement(); // Iniciamos la búsqueda
}

function modifyTable() {
    const table = document.querySelector("table.list.view.table-responsive");

    if (!table) {
        console.log("No se encontró la tabla.");
        return;
    }

    // Encuentra los encabezados de la tabla para identificar columnas
    const headers = Array.from(table.querySelectorAll("th"));
    const colIndex = {
        documentName: headers.findIndex(th => th.textContent?.trim() === "Hoja de Ruta"),
        nroInforme: headers.findIndex(th => th.textContent?.trim() === "N° Informe Resolutivo"),
        nroOficio: headers.findIndex(th => th.textContent?.trim() === "N° Oficio Resolutivo"),
    };

    if (Object.values(colIndex).some(index => index === -1)) {
        console.log("No se encontraron todas las columnas necesarias.");
        return;
    }

    // Iterar sobre las filas de la tabla
    table.querySelectorAll("tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < Math.max(...Object.values(colIndex))) return;

        const documentName = cells[colIndex.documentName]?.innerText.trim();
        const nroInforme = cells[colIndex.nroInforme]?.innerText.trim();
        const nroOficio = cells[colIndex.nroOficio]?.innerText.trim();

        if (!nroOficio && nroInforme) {
            const button = document.createElement("button");
            button.style.padding = "6px 12px";
            button.style.cursor = "pointer";
            button.style.border = "none";
            button.style.borderRadius = "8px";
            button.style.minWidth = "95px"
            button.style.textAlign = "center";
            button.style.color = "white";
            button.style.fontSize = "14px";
            button.style.fontWeight = "bold";
            button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
            button.style.transition = "background-color 0.3s ease, transform 0.1s ease";

            let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsGenerated") ?? [];
            if (roadmapsGenerated.includes(documentName)) {
                button.textContent = "Generado";
                button.style.backgroundColor = "#9c2b1f";
            } else {
                button.textContent = "Generar";
                button.style.backgroundColor = "#E56455";
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

            button.onclick = (e: Event) => {
                e.preventDefault();
                showModal("Ejecutando...", 2000);
                chrome.runtime.sendMessage({ action: 'searchRoadMap', data: { roadmap: documentName } });

                button.style.backgroundColor = "#9c2b1f";
                button.textContent = "Generado";

                let roadmapsGenerated = obtenerDeLocalStorage<string[]>("roadmapsGenerated") ?? [];
                guardarEnLocalStorage("roadmapsGenerated", [...roadmapsGenerated, documentName]);
            };


            cells[colIndex.nroOficio].innerHTML = "";
            cells[colIndex.nroOficio].appendChild(button);
        }
    });
}

function guardarEnLocalStorage<T>(clave: string, objeto: T): void {
    try {
        const objetoString = JSON.stringify(objeto);
        localStorage.setItem(clave, objetoString);
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
    }
}

function obtenerDeLocalStorage<T>(clave: string): T | null {
    try {
        const objetoString = localStorage.getItem(clave);
        return objetoString ? JSON.parse(objetoString) : null;
    } catch (error) {
        console.error("Error al obtener datos de localStorage:", error);
        return null;
    }
}


chrome.runtime.sendMessage({ action: "waiting", nextScript: "modifyTable" });