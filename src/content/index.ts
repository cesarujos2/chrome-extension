import { ModalOverlay } from './features/ModalOverlay';
import { Request } from "../interfaces/frontData";
import { findElementsWithRetry, findElementWithRetry } from './features/findElementWithRetry';
import { modifyTable } from './features/modifyTable';
import { getRowUO } from './features/getRowUO';
import { getBoss } from './features/getBossSTD';
import { getUserByName } from './features/getUserByName';
import { customTefi } from './features/customTefi';

chrome.runtime.onMessage.addListener(async function (request: Request) {
    if (request.action === 'loadRoadMap') {
        const fromLogin = document.getElementById('frmLogin') as HTMLFormElement
        if (!fromLogin) {
            const roadmap = request.data.document_name
            if (roadmap.length > 0) {
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
                chrome.runtime.sendMessage({ action: "waiting", nextScript: "isRepeatRoadMap" });
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
                        if (!request.data.options.onlySearch) {
                            chrome.runtime.sendMessage({ action: "waiting", nextScript: "isPosibleToDerive" });
                        }
                        break
                    }
                }
            }
        } else {
            if (!request.data.options.onlySearch) {
                chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "isPosibleToDerive" });
            }
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
                        ModalOverlay.showModal("Ya ha sido derivado, ¿desea proceder a derivar igualmente?", 8000, () => {
                            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "clickOnGenerateDocument" });
                        })
                        return;
                    }
                }
            }
            chrome.runtime.sendMessage({ action: "inCurrentTab", nextScript: "clickOnGenerateDocument" });
        } else {
            ModalOverlay.showModal("No se encontró la tabla de movimientos.");
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
                        chrome.runtime.sendMessage({ action: "waiting", nextScript: "removeResponsible" });
                    }

                    break
                }
            }
            if (!encontrado) {
                ModalOverlay.showModal("No existe la opción de generar documento electrónico");
            }
        }
    }
    if (request.action === 'removeResponsible') {
        const tableSigners = await findElementWithRetry("#idproyectonuevo\\:idtabla_visadores_readonly_data") as any
        tableSigners?.children[0].children[7].children[0].click()
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "typeOfDocument", data: { delay: 300 } });
    }

    if (request.action === 'typeOfDocument') {
        const typeDoc = await findElementWithRetry("#idproyectonuevo\\:iddocumentos_label")
        if (typeDoc) { typeDoc.click() }

        const documentTypes = await findElementsWithRetry(() => {
            return Array.from(document.getElementById("idproyectonuevo:iddocumentos_items")?.children || []) as HTMLLIElement[]
        });
        if (!documentTypes || !(Array.isArray(documentTypes) || (Array.isArray(documentTypes) && documentTypes.length == 0))) { return; }

        let ofType = documentTypes.find((item) => item.textContent?.trim().toLowerCase() === "oficio") as HTMLLIElement
        ofType.click()

        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addSubject", data: { delay: 300 } });
    }

    if (request.action === 'addSubject') {
        let asunto = document.getElementById("idproyectonuevo:idAsCP") as HTMLInputElement
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
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addOrganicUnit", data: { delay: 300 } });
    }

    if (request.action === 'addOrganicUnit') {
        let openUO = (await findElementWithRetry("#idproyectonuevo\\:seccionBuscarFirmante"))?.querySelector("button") as HTMLButtonElement
        if (!openUO) { return; }
        openUO.click()

        const dialogUO = await findElementWithRetry("#myDialogUO") as HTMLDivElement
        const inputUO = dialogUO?.querySelectorAll("input")[1] as HTMLInputElement
        const tableUO = dialogUO?.querySelector("table") as HTMLTableElement
        if (!inputUO || !tableUO) { throw new Error("No se encontró el input de UO destino"); }

        const rowUO = await getRowUO(inputUO, tableUO, '26');
        const checkUO = rowUO?.querySelector("input") as HTMLInputElement
        const aceptarUO = dialogUO?.querySelector("form")?.querySelector("a") as HTMLAnchorElement
        const addFirm = (await findElementWithRetry("#idproyectonuevo\\:seccionAddFirmante"))?.querySelector("button") as HTMLButtonElement
        if (!checkUO || !aceptarUO || !addFirm) { throw new Error("No se encontró el check de UO destino"); }
        checkUO.click()
        aceptarUO.click()
        addFirm.click()

        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "addVisador", data: { delay: 300 } });
    }

    if (request.action === 'addVisador') {
        const buttonVisador = await findElementWithRetry("#idproyectonuevo\\:seccionBotonesVisador")
        if (!buttonVisador) { return; }

        buttonVisador.querySelectorAll("button")[1].click()
        
        const dialogVisador = await findElementWithRetry("#myDialogVisadores") as HTMLDivElement
        const tableUOVisador = dialogVisador?.querySelector("table") as HTMLTableElement
        const firstRowUOVisador = tableUOVisador?.querySelector("tbody")?.querySelectorAll("tr")[1] as HTMLTableRowElement
        const checkSecondRowUOVisador = firstRowUOVisador?.querySelector("input") as HTMLInputElement
        const aceptarVisador = dialogVisador?.querySelector("form")?.querySelector("a") as HTMLAnchorElement
        if (!checkSecondRowUOVisador) { throw new Error("No se encontró el check de UO destino"); }
        await new Promise((resolve) => setTimeout(resolve, 500));
        checkSecondRowUOVisador.click()

        const bossName = getBoss() ?? 'VICTOR ORLANDO';
        const checkedVisador1 = await getUserByName(dialogVisador, bossName, 0, true);
        if (!checkedVisador1) {
            ModalOverlay.showModal("No se encontró el usuario " + bossName, 5000);
            return;
        }
        aceptarVisador.click()

        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "mayNeedUODestination", data: { delay: 300 } });
    }

    if (request.action === 'mayNeedUODestination') {
        if (request.data.status_id == 'desaprobado') {
            const sectionSelectDestination = await findElementWithRetry("#idproyectonuevo\\:seccionElegirDestinatarios")
            if (!sectionSelectDestination) { return; }
            const buttonOpenDestination = sectionSelectDestination.querySelector("button") as HTMLButtonElement
            buttonOpenDestination.click()

            const dialogUO = await findElementWithRetry("#dialogo_uo") as HTMLDivElement
            const inputUO = dialogUO?.querySelectorAll("input")[2] as HTMLInputElement
            const tableUO = dialogUO?.querySelector("table") as HTMLTableElement
            if (!inputUO || !tableUO) { throw new Error("No se encontró el input de UO destino"); }


            const rowUO = await getRowUO(inputUO, tableUO, '29');
            const checkUO = rowUO?.querySelector("input") as HTMLInputElement
            if (!checkUO) { throw new Error("No se encontró el check de UO destino"); }
            checkUO.click()
            const aceptarUO = dialogUO?.querySelector("form")?.querySelectorAll("button")[0] as HTMLButtonElement
            aceptarUO.click()
        }
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "selectAdministered", data: { delay: 300 } });
    }

    if (request.action === 'selectAdministered') {
        const inputsJuridica = document.getElementById("dlg_ruc")?.querySelectorAll("input");
        const textareaJuridica = document.getElementById("dlg_ruc")?.querySelector("textarea");
        if (!inputsJuridica || !inputsJuridica[1] || !inputsJuridica[7] || !textareaJuridica) { return; }
        inputsJuridica[1].value = request.data.nro_doc_identificacion_c;
        inputsJuridica[7].value = request.data.first_name + ' ' + request.data.last_name;
        textareaJuridica.textContent = `El administrado autorizó notificación vía correo electrónico a los siguientes correos: ${request.data.emails_concat}`;
        const buttons = document.getElementById("dlg_ruc")?.querySelectorAll("button")
        buttons?.[1].click()
        await new Promise(resolve => setTimeout(resolve, 1000));
        buttons?.[0].click()
        if (!request.data.options.noDownload) {
            chrome.runtime.sendMessage({ action: "getDocumentFitac" });
        }
        chrome.runtime.sendMessage({ action: "inCurrentTabWithDelay", nextScript: "generarDocumento", data: { delay: 800 } });



    }

    if (request.action === 'generarDocumento') {
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
        const linkShowUploadPdf = await findElementWithRetry("#idproyectonuevo\\:linkShowUploadPdf")
        if (!linkShowUploadPdf) { return; }
        linkShowUploadPdf.click()
        const sectionDocFirmado = await findElementWithRetry("#idproyectonuevo\\:seccionDocFirmado", 1000, 1000) as HTMLDivElement
        if (!sectionDocFirmado) { return; }
        const seccionBotones = Array.from(document.getElementById("idproyectonuevo:seccionBotones")?.querySelectorAll("button") ?? []) as HTMLButtonElement[]
        if (!seccionBotones) { return; }
        seccionBotones.forEach(x => {
            if (x.textContent == 'Despachar') {
                x.click()
            }
        })
    }

    if (request.action === "downloadFitacNew") {
        const modal = ModalOverlay.showModal("Descargando documento...");
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
        modal.closeModal();
    }

    if (request.action === "injectTheme") {
        if (request.data.theme === "dark") {
            customTefi();
        }
    }
})


modifyTable();
chrome.runtime.sendMessage({ action: "getTheme" })