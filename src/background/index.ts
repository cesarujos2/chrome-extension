import { IFitac, Request } from "../interfaces/frontData"
import { TefiDB } from "../services/tefiDB"
import { blobToBase64 } from "./features/BlobToBase64"
import { injectCurrentTab } from "./features/injectCurrentTab"
import { injectForId } from "./features/injectForId"
import { openNewTab } from "./features/openNewTab"
import { waiting } from "./features/waiting"

const storeData: FrontData = {
    roadmap: '',
    data: {
        document_name: '',
        id: '',
        status_id: '',
        tipo_expediente_c: '',
        nro_doc_identificacion_c: '',
        emails_concat: '',
        nameProyect: '',
        first_name: '',
        last_name: '',
    },
    options: {
        onlySearch: false,
        noDownload: false,
        despachar: false,
        copyDate: false,
    }
}

const credentialData: CredentialsData = {
    password: null,
    certificateFile: null
}

interface CredentialsData {
    password: string | null;
    certificateFile: string | null;
}

chrome.runtime.onMessage.addListener(async function (request: Request) {
    if (request.action === 'searchRoadMap') {
        storeData.roadmap = request.data.roadmap
        if (!storeData.options.onlySearch) {
            const Tefi = new TefiDB()
            const data = await Tefi.getFitac(storeData.roadmap)

            chrome.runtime.sendMessage({ action: 'resultSearch', data: { noFinded: data.length == 0 } })
            if (data.length == 0) {
                return
            }
            storeData.data = data[0]
        } else {
            storeData.data.document_name = request.data.roadmap
            chrome.runtime.sendMessage({ action: 'resultSearch', data: { noFinded: false } })
        }
        chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
            const stdOpened = tabs.filter(tab => {
                if (tab.url) {
                    return tab.url.includes('std.mtc.gob.pe')
                }
            })

            if (stdOpened.length > 0 && stdOpened[0].id) {
                chrome.tabs.update(stdOpened[0].id, { active: true })
                injectForId(stdOpened[0].id, { action: 'loadRoadMap', data: { ...storeData.data, options: storeData.options } })
            } else {
                openNewTab('https://std.mtc.gob.pe/tramite/paginas/expediente.htm', { action: 'loadRoadMap', data: { ...storeData.data, options: storeData.options } })
            }
        })
    }
    if (request.action === 'waiting') {
        if (request.nextScript && request.nextScript.length > 0) {
            waiting({ action: request.nextScript, data: { ...storeData.data, options: storeData.options } })
        }
    }
    if (request.action === 'setOption') {
        request.data.key == 'onlySearch' ? storeData.options.onlySearch = request.data.value : null
        request.data.key == 'noDownload' ? storeData.options.noDownload = request.data.value : null
        request.data.key == 'despachar' ? storeData.options.despachar = request.data.value : null
        request.data.key == 'copyDate' ? storeData.options.copyDate = request.data.value : null

    }

    if (request.action === "saveCertificate") {
        credentialData.password = request.data.password
        credentialData.certificateFile = request.data.certificate
    }

    if (request.action === 'inCurrentTab') {
        if (request.nextScript && request.nextScript.length > 0) {
            injectCurrentTab({ action: request.nextScript, data: { ...storeData.data, options: storeData.options } })
        }
    }
    if (request.action === 'inCurrentTabWithDelay') {
        setTimeout(() => {
            if (request.nextScript && request.nextScript.length > 0) {
                injectCurrentTab({ action: request.nextScript, data: { ...storeData.data, options: storeData.options } })
            }
        }, request.data.delay)
    }
    if (request.action === 'openTefi') {
        openNewTab(`https://dgprc.atm-erp.com/dgprc/index.php?module=Fitac_fitac&offset=1&stamp=1687286622051739500&return_module=Fitac_fitac&action=DetailView&record=${storeData.data.id}`, { action: request.nextScript ?? '', data: { ...storeData.data, options: storeData.options } })
    }
    if (request.action === "getDocumentFitac") {
        const statusId = storeData.data.status_id
        const tipoExpediente = storeData.data.tipo_expediente_c

        let idTemplate
        switch (statusId) {
            case 'completa':
            case 'incompleta':
                idTemplate = 'ed00bd5d-4f85-19af-a915-5dc2f57dcd32';
                break;
            case 'amerita_evap':
                idTemplate = '73107e4c-c398-bc4f-eac3-5dc5a402e07f';
                break;
            case 'improcedente':
                idTemplate = '1fbf8a11-9a56-7edb-af18-5de8291aaa7e';
                break;
            case 'duplicada':
                idTemplate = '1a689f7a-1c89-6e2d-c4e4-5e0fd3489b8c';
                break;
            default:
                idTemplate = null;
        }

        if(tipoExpediente == "desestimiento"){
            idTemplate = '85990911-ff40-4882-f0bc-5ddc0f8567da';
        }

        if (idTemplate) {
            const Tefi = new TefiDB();
            let blob;

            try {
                if (credentialData.password && credentialData.certificateFile) {
                    blob = await Tefi.getSignPDF(storeData.data.id, idTemplate, credentialData.certificateFile, credentialData.password);
                } else {
                    blob = await Tefi.getPDF(storeData.data.id, idTemplate);
                }
            } catch (error) {
                console.error("Error al generar el PDF:", error);
                blob = await Tefi.getPDF(storeData.data.id, idTemplate);
            }

            if (blob) {
                const base64 = await blobToBase64(blob);
                injectCurrentTab({ action: "downloadFitacNew", data: { base64: base64, roadmap: storeData.roadmap } });
            } else {
                console.error("No se pudo generar el blob para la conversión a base64.");
            }
        }
    }

}

)

export interface FrontData {
    roadmap: string;
    data: IFitac;
    options: {
        onlySearch: boolean;
        noDownload: boolean;
        despachar: boolean;
        copyDate: boolean;
    }
}