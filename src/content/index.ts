import { ModalOverlay } from './features/ModalOverlay';
import { findElementsWithRetry, findElementWithRetry } from './features/findElementWithRetry';
import { modifyTable } from './features/modifyTable';
import { getRowUO } from './features/getRowUO';
import { getBoss } from './features/getBossSTD';
import { getUserByName } from './features/getUserByName';
import { customTefi } from './features/customTefi';
import { IRequest } from '../models/IRequest';
import { createRequest } from './utils/createRequestContent';
import { copyText } from './features/copyText';
import { sendMessageAsync } from './utils/sendMessageAsync';
import { addButtonFITAC } from './features/addButtonFITAC';

chrome.runtime.onMessage.addListener(async function (request: IRequest) {
    if (request.action === 'loadRoadMap') {
        const fromLogin = document.getElementById('frmLogin') as HTMLFormElement
        if (!fromLogin) {
            const roadmap = request.content.fitacData.document_name
            if (roadmap && roadmap.length > 0) {
                let inputHRSTD = document.getElementById('idformbusq:idhrbuscar') as HTMLInputElement
                let buttonBuscarSTD = document.getElementById('idformbusq:btnBuscarHojaDeRuta')
                let anio = document.getElementById('idformbusq:idanioexpediente_input') as HTMLInputElement
                if (!inputHRSTD || !buttonBuscarSTD || !anio) {
                    inputHRSTD = document.getElementById('header:formtitulo:idhrbuscar') as HTMLInputElement
                    buttonBuscarSTD = document.getElementById('header:formtitulo:btnBuscarHojaDeRuta') as HTMLButtonElement
                    anio = document.getElementById('header:formtitulo:idanioexpediente_input') as HTMLInputElement
                }
                inputHRSTD.value = roadmap.split("-")[1];
                anio.value = roadmap.split("-")[2]
                buttonBuscarSTD.click();

                // Emitir un evento cuando se hace clic en el botón de búsqueda
                request.action = 'waiting';
                request.nextScript = 'isRepeatRoadMap';
                chrome.runtime.sendMessage(request);
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

                        // Emitir un evento cuando se hace clic en el botón de búsqueda
                        request.action = 'waiting';
                        request.nextScript = 'isPosibleToDerive';
                        chrome.runtime.sendMessage(request);
                        break
                    }
                }
            }
        } else {
            // Si la lista de elementos existe, buscar el elemento "Generar doc. electronico"
            request.action = 'inCurrentTab';
            request.nextScript = 'isPosibleToDerive';
            chrome.runtime.sendMessage(request);
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
                    if ((lastCell?.textContent?.trim().toUpperCase() === "VISAR" && request.content.isOffice) ||
                        (lastCell?.textContent?.trim().toUpperCase() === "FIRMAR" && !request.content.isOffice)) {
                        ModalOverlay.showModal("Ya ha sido derivado!",
                            () => {
                                request.action = "inCurrentTab"
                                request.nextScript = "checkIsMasivo"
                                chrome.runtime.sendMessage(request);
                            }
                            , () => {
                                //* Si el usuario acepta, se hace clic en el botón de "Generar doc. electronico" */
                                request.action = 'inCurrentTab';
                                request.nextScript = 'clickOnGenerateDocument';
                                chrome.runtime.sendMessage(request);
                            })
                        return;
                    }
                }
            }

            // Si no se encontró el botón "Generar doc. electronico", se envía un mensaje para continuar con el flujo
            request.action = 'inCurrentTab';
            request.nextScript = 'clickOnGenerateDocument';
            chrome.runtime.sendMessage(request);
        } else {
            ModalOverlay.showModal("No se encontró la tabla de movimientos.", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
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
                    let liGenerarDoc = listaUl.children[i];
                    const enlace = liGenerarDoc as HTMLAnchorElement;
                    enlace.click()

                    const btnNumAdmin = await findElementWithRetry("#frmSelecctNumeracion\\:btnNumAdm")
                    if (btnNumAdmin) {
                        btnNumAdmin.click()

                        //  Se emite eveneto la darle click a generar documento
                        request.action = "waiting";
                        request.nextScript = "removeResponsible";
                        chrome.runtime.sendMessage(request);
                    }

                    break
                }
            }
            if (!encontrado) {
                ModalOverlay.showModal("No existe la opción de generar documento electrónico", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
            }
        }
    }
    if (request.action === 'removeResponsible') {
        if (request.content.isOffice) {
            const tableSigners = await findElementWithRetry("#idproyectonuevo\\:idtabla_visadores_readonly_data") as any
            tableSigners?.children[0].children[7].children[0].click()
        }

        //Se emite evento al terminar de evaluar si se quita al jefe
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "typeOfDocument"
        request.delay = 300
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'typeOfDocument') {
        const typeDoc = await findElementWithRetry("#idproyectonuevo\\:iddocumentos_label")
        if (typeDoc) { typeDoc.click() }

        const documentTypes = await findElementsWithRetry(() => {
            return Array.from(document.getElementById("idproyectonuevo:iddocumentos_items")?.children || []) as HTMLLIElement[]
        });
        if (!documentTypes || !(Array.isArray(documentTypes) || (Array.isArray(documentTypes) && documentTypes.length == 0))) { return; }

        let ofType = documentTypes.find((item) => (item.textContent?.trim().toLowerCase() === "oficio" && request.content.isOffice) ||
            (item.textContent?.trim().toLowerCase() === "informe" && !request.content.isOffice)) as HTMLLIElement
        ofType.click()

        //Emitir evento al seleccionar tipo de documento
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "addSubject"
        request.delay = 300

        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'addSubject') {
        let asunto = document.getElementById("idproyectonuevo:idAsCP") as HTMLInputElement
        asunto.textContent = ''
        if (request.content.fitacData.tipo_expediente_c == 'desestimiento') {
            asunto.textContent = `Solicitud de desistimiento de la Ficha Técnica para Proyectos de Infraestructura de Telecomunicaciones que NO están sujetos al Sistema Nacional de Evaluación de Impacto Ambiental (SEIA) del proyecto ${request.content.fitacData.nameProyect}`
        } else if (request.content.isOffice) {
            switch (request.content.fitacData.status_id) {
                case 'aprobado':
                case 'desaprobado':
                case 'observado':
                    asunto.textContent = `Remite resultado de verificación de la Ficha Técnica Ambiental presentada para el proyecto de infraestructura de telecomunicaciones que no está sujeto al Sistema Nacional de Evaluación de Impacto Ambiental - SEIA`
                    break;
                case 'duplicada':
                case 'improcedente':
                    asunto.textContent = `Verificación de la Ficha Técnica presentada para el proyecto de Infraestructura de Telecomunicaciones denominado "${request.content.fitacData.nameProyect}" que no está sujeto al Sistema Nacional de Evaluación de Impacto Ambiental (SEIA)`
                    break;
                default:
                    asunto.textContent = `Remite resultado de verificación de la Ficha Técnica Ambiental presentada para el proyecto de infraestructura de telecomunicaciones que no está sujeto al Sistema Nacional de Evaluación de Impacto Ambiental - SEIA.`
            }

            //Emitir evento en caso sea oficio
            request.action = "inCurrentTabWithDelay"
            request.nextScript = "addOrganicUnit"
            request.delay = 300
            chrome.runtime.sendMessage(request);
        } else {
            asunto.textContent = `Resultado de la evaluación de Ficha Técnica Ambiental del proyecto denominado ${request.content.fitacData.nameProyect}.`

            //Emitir evento en caso NO sea oficio
            request.action = "inCurrentTabWithDelay"
            request.nextScript = "addFirmantes"
            request.delay = 300
            chrome.runtime.sendMessage(request);
        }
    }

    if (request.action === 'addOrganicUnit') {
        let openUO = (await findElementWithRetry("#idproyectonuevo\\:seccionBuscarFirmante"))?.querySelector("button") as HTMLButtonElement
        if (!openUO) { return; }
        openUO.click()

        const dialogUO = await findElementWithRetry("#myDialogUO") as HTMLDivElement
        const inputUO = dialogUO?.querySelectorAll("input")[1] as HTMLInputElement
        const tableUO = dialogUO?.querySelector("table") as HTMLTableElement
        if (!inputUO || !tableUO) {
            ModalOverlay.showModal("No se encontró el input de UO destino", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }

        const rowUO = await getRowUO(inputUO, tableUO, '26');
        const checkUO = rowUO?.querySelector("input") as HTMLInputElement
        const aceptarUO = dialogUO?.querySelector("form")?.querySelector("a") as HTMLAnchorElement
        const addFirm = (await findElementWithRetry("#idproyectonuevo\\:seccionAddFirmante"))?.querySelector("button") as HTMLButtonElement
        if (!checkUO || !aceptarUO || !addFirm) {
            ModalOverlay.showModal("No se encontró el check de UO destino", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }
        checkUO.click()
        aceptarUO.click()
        addFirm.click()

        //Emitir eveneto para agregar visador
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "addVisador"
        request.delay = 300
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'addVisador') {
        const buttonVisador = await findElementWithRetry("#idproyectonuevo\\:seccionBotonesVisador")
        if (!buttonVisador) {
            ModalOverlay.showModal("No se encontró el botón de visador", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }

        buttonVisador.querySelectorAll("button")[1].click()

        const dialogVisador = await findElementWithRetry("#myDialogVisadores") as HTMLDivElement
        const tableUOVisador = dialogVisador?.querySelector("table") as HTMLTableElement
        const inputUOVisador = dialogVisador?.querySelectorAll("input")[1] as HTMLInputElement
        if (!inputUOVisador || !tableUOVisador) {
            ModalOverlay.showModal("No se encontró el input de UO del visador", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }

        const rowUOVisador = await getRowUO(inputUOVisador, tableUOVisador, '26.01');
        const checkUOVisador = rowUOVisador?.querySelector("input") as HTMLInputElement
        if (!checkUOVisador) {
            ModalOverlay.showModal("No se encontró el check de UO del visador", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }
        checkUOVisador.click()

        const bossName = getBoss();
        if (!bossName) {
            ModalOverlay.showModal("No se encontró Jefe", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return
        }
        const checkedVisador1 = await getUserByName(dialogVisador, bossName, 0, true);
        if (!checkedVisador1) {
            ModalOverlay.showModal("No se encontró el usuario " + bossName, () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }
        const aceptarVisador = dialogVisador?.querySelector("form")?.querySelector("a") as HTMLAnchorElement
        aceptarVisador.click()

        //emitir evento al añadir visador
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "mayNeedUODestination"
        request.delay = 300
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'addFirmantes') {
        if (request.config.signLegal) {
            const buttonVisador = await findElementWithRetry("#idproyectonuevo\\:seccionBotonesVisador")
            if (!buttonVisador) {
                ModalOverlay.showModal("No se encontró el botón de visador", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }

            buttonVisador.querySelectorAll("button")[2].click()

            const dialogVisador = await findElementWithRetry("#myDialogVisadores") as HTMLDivElement
            const tableUOVisador = dialogVisador?.querySelector("table") as HTMLTableElement
            const inputUOVisador = dialogVisador?.querySelectorAll("input")[1] as HTMLInputElement
            if (!inputUOVisador || !tableUOVisador) {
                ModalOverlay.showModal("No se encontró el input de UO del firmante", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }

            const rowUOVisador = await getRowUO(inputUOVisador, tableUOVisador, '26.01');
            const checkUOVisador = rowUOVisador?.querySelector("input") as HTMLInputElement
            if (!checkUOVisador) {
                ModalOverlay.showModal("No se encontró el check de UO del firmante", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }
            checkUOVisador.click()

            const bossName = 'LUIS JESUS CARBAJAL MANCO';
            const checkedVisador1 = await getUserByName(dialogVisador, bossName, 0, true);
            if (!checkedVisador1) {
                ModalOverlay.showModal("No se encontró el usuario " + bossName, () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }
            const aceptarVisador = dialogVisador?.querySelector("form")?.querySelector("a") as HTMLAnchorElement
            aceptarVisador.click()
        }

        //Emitir evento al agregar firmante
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "selectUODestinationInforme"
        request.delay = 300
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'selectUODestinationInforme') {
        const sectionSelectDestination = await findElementWithRetry("#idproyectonuevo\\:seccionElegirDestinatarios")
        if (!sectionSelectDestination) {
            ModalOverlay.showModal("No se encontró la sección de elegir destinatarios", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }
        const buttonOpenDestination = sectionSelectDestination.querySelector("button") as HTMLButtonElement
        buttonOpenDestination.click()

        const dialogUO = await findElementWithRetry("#dialogo_uo") as HTMLDivElement
        const inputUO = dialogUO?.querySelectorAll("input")[2] as HTMLInputElement
        const tableUO = dialogUO?.querySelector("table") as HTMLTableElement
        if (!inputUO || !tableUO) {
            ModalOverlay.showModal("No se encontró el input de UO destino", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }

        const rowUO = await getRowUO(inputUO, tableUO, '26');
        const checkUO = rowUO?.querySelector("input") as HTMLInputElement
        if (!checkUO) {
            ModalOverlay.showModal("No se encontró el check de UO destino", () => {
                request.action = "inCurrentTab"
                request.nextScript = "checkIsMasivo"
                chrome.runtime.sendMessage(request);
            });
            return;
        }
        checkUO.click()
        const aceptarUO = dialogUO?.querySelector("form")?.querySelectorAll("button")[0] as HTMLButtonElement
        aceptarUO.click()
        // if (!request.data.options.noDownload) {
        //     chrome.runtime.sendMessage({ action: "getReportFitac" });
        // }

        //Emitir evento al seleccionar unidad organica del informe
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "generarDocumento"
        request.delay = 800
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'mayNeedUODestination') {
        if (request.content.fitacData.status_id == 'desaprobado') {
            const sectionSelectDestination = await findElementWithRetry("#idproyectonuevo\\:seccionElegirDestinatarios")
            if (!sectionSelectDestination) {
                ModalOverlay.showModal("No se encontró la sección de elegir destinatarios", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }
            const buttonOpenDestination = sectionSelectDestination.querySelector("button") as HTMLButtonElement
            buttonOpenDestination.click()

            const dialogUO = await findElementWithRetry("#dialogo_uo") as HTMLDivElement
            const inputUO = dialogUO?.querySelectorAll("input")[2] as HTMLInputElement
            const tableUO = dialogUO?.querySelector("table") as HTMLTableElement
            if (!inputUO || !tableUO) {
                ModalOverlay.showModal("No se encontró el input de UO destino", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }

            const rowUO = await getRowUO(inputUO, tableUO, '29');
            const checkUO = rowUO?.querySelector("input") as HTMLInputElement
            if (!checkUO) {
                ModalOverlay.showModal("No se encontró el check de UO destino", () => {
                    request.action = "inCurrentTab"
                    request.nextScript = "checkIsMasivo"
                    chrome.runtime.sendMessage(request);
                });
                return;
            }
            checkUO.click()
            const aceptarUO = dialogUO?.querySelector("form")?.querySelectorAll("button")[0] as HTMLButtonElement
            aceptarUO.click()
        }

        //Emitir evento despues de seleccionar la unidad organica en caso sea desaprobado
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "selectAdministered"
        request.delay = 300
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'selectAdministered') {
        const inputsJuridica = document.getElementById("dlg_ruc")?.querySelectorAll("input");
        const textareaJuridica = document.getElementById("dlg_ruc")?.querySelector("textarea");
        if (!inputsJuridica || !inputsJuridica[1] || !inputsJuridica[7] || !textareaJuridica) { return; }
        inputsJuridica[1].value = request.content.fitacData.nro_doc_identificacion_c ?? "";
        inputsJuridica[7].value = request.content.fitacData.first_name + ' ' + request.content.fitacData.last_name;
        textareaJuridica.textContent = `El administrado autorizó notificación vía correo electrónico a los siguientes correos: ${request.content.fitacData.emails_concat}`;
        const buttons = document.getElementById("dlg_ruc")?.querySelectorAll("button")
        buttons?.[1].click()
        await new Promise(resolve => setTimeout(resolve, 1000));
        buttons?.[0].click()
        if (request.content.isOffice) {
            //Descargar documento si es oficio
            request.action = "getOfficeFitac"
            chrome.runtime.sendMessage(request);
        }

        //Emitir evento despues de seleccionar administrado
        request.action = "inCurrentTabWithDelay"
        request.nextScript = "generarDocumento"
        request.delay = 800
        chrome.runtime.sendMessage(request);
    }

    if (request.action === 'generarDocumento') {
        await copyText(request.content.fitacData.document_name ?? "");
        document.getElementById("idproyectonuevo:btnDespachar")?.click()
        document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button")[0]?.click();
        const d = async (intentos: number = 0) => {
            if (intentos > 10) { return null; }
            const nButtons = document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button").length
            if (nButtons && nButtons > 2) {
                return Array.from(document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button") ?? []) as HTMLButtonElement[];
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            return d(intentos + 1);
        }
        const buttons = await d();
        if (!buttons) { return; }
        buttons.forEach(x => {
            x.textContent == 'Generar Doc.' && x.click();
        })
        if (!request.content.isOffice) {
            const linkShowUploadPdf = await findElementWithRetry("#idproyectonuevo\\:linkShowUploadPdf")
            if (!linkShowUploadPdf) { return; }
            linkShowUploadPdf.click()
        }
        const sectionDocFirmado = await findElementWithRetry("#idproyectonuevo\\:seccionDocFirmado") as HTMLDivElement
        if (!sectionDocFirmado) { return; }
        const seccionBotones = Array.from(document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button") ?? []) as HTMLButtonElement[]
        if (!seccionBotones) { return; }
        seccionBotones.forEach(x => {
            if (x.textContent == 'Despachar') {
                x.click();

                const reqSet = createRequest()
                reqSet.action = "setRoadmapGenerated"
                reqSet.content.isOffice = request.content.isOffice
                reqSet.content.fitacData.document_name = request.content.fitacData.document_name
                sendMessageAsync(reqSet)
            }
        })

        request.action = "waiting"
        request.nextScript = "checkIsMasivo"
        request.delay = 3000
        chrome.runtime.sendMessage(request);

    }

    if (request.action == "checkIsMasivo") {
        request.action = "searchRoadMap"
        request.content.index = request.content.index + 1
        chrome.runtime.sendMessage(request);
    }

    if (request.action === "downloadFitacNew") {
        const base64 = request.content.docBase64;
        const fileName = request.content.fileName;
        if (!base64 || !fileName) {
            return
        }

        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)?.[1];
        const binaryString = atob(data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mime });
        const file = new File([blob], `${fileName}.pdf`, { type: mime });

        const linkShowUploadPdf = await findElementWithRetry("#idproyectonuevo\\:linkShowUploadPdf", 1000, 1000) as HTMLDivElement
        if (!linkShowUploadPdf) { return; }
        const inputFile = await findElementWithRetry('#formCargarPDf\\:iduploadPDf_input', 1000, 1000) as HTMLInputElement
        if (!inputFile) { return; }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        inputFile.files = dataTransfer.files;
        inputFile.dispatchEvent(new Event('change', { bubbles: true }));

    }

    if (request.action === "injectTheme") {
        if (request.config.theme === "dark") {
            customTefi();
        }
    }
})


modifyTable();
addButtonFITAC();

const request = createRequest()
request.action = "getTheme"
chrome.runtime.sendMessage(request)


const observer = new MutationObserver(() => {
    console.log("MutationObserver SweetAlert triggered");
    const sweetAlert = document.querySelector(".sweet-alert.showSweetAlert.visible") as HTMLDivElement;
    const sweetOverlay = document.querySelector(".sweet-overlay") as HTMLDivElement;

    if (sweetAlert && sweetOverlay) {
        sweetAlert.style.display = "none";
        sweetOverlay.style.display = "none";
        observer.disconnect();
    }
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);


