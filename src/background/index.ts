import { TefiDB } from "../services/tefiDB"
import { blobToBase64 } from "./features/BlobToBase64"
import { injectTab } from "./features/injectCurrentTab"
import { openNewTab } from "./features/openNewTab"
import { waiting } from "./features/waiting"
import { IRequest } from "../models/IRequest"
import { createRequest } from "./utils/createRequestBackground"


setInitialConfigInStorage();

chrome.runtime.onMessage.addListener(async function (request: IRequest, sender) {

    if (request.action === 'setConfig') {
        await setConfigInStorage(request.config);
    }

    if (request.action === 'setRoadmapGenerated') {
        const roadmap = request.content.fitacData.document_name
        if (roadmap) {
            await setRoadmapGeneratedInStorage(roadmap, request.content.isOffice)
        }
    }

    if (request.action === 'getTheme') {
        const config = await getConfigFromStorage()
        const theme = config?.theme
        if (theme && typeof (theme) == 'string') {
            chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
                const tabsOpened = tabs.filter(tab => {
                    if (tab.url) {
                        return tab.url.includes('https://std.mtc.gob.pe') || tab.url.includes("https://dgprc.atm-erp.com")
                    }
                })
                if (tabsOpened.length > 0) {
                    tabsOpened.forEach(tab => {
                        if (tab.id) {
                            request.action = "injectTheme"
                            request.config.theme = theme
                            injectTab(request, tab.id)
                        }
                    })
                }
            })
        }
    }

    if (request.action === 'searchRoadMap') {
        const config = await getConfigFromStorage()
        const roadmap = request.content.documents[request.content.index]
        if (!roadmap) { return }
        const data = await TefiDB.getFitac(roadmap)
        if (data.length == 0) { return }
        request.content.fitacData = data[0]
        request.content.isOffice = request.content.isOffice
        request.config = config

        chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
            const stdOpened = tabs.filter(tab => {
                if (tab.url) {
                    return tab.url.includes('https://std.mtc.gob.pe')
                }
            })

            request.action = "loadRoadMap"
            if (stdOpened.length > 0 && stdOpened[0].id) {
                chrome.tabs.update(stdOpened[0].id, { active: false })
                injectTab(request, stdOpened[0].id)
            } else {
                openNewTab('https://std.mtc.gob.pe/tramite/', request)
            }
        })
    }
    if (request.action === 'waiting') {
        if (request.nextScript && request.nextScript.length > 0) {
            request.action = request.nextScript
            waiting(request, sender.tab?.id)
        }
    }

    if (request.action === 'inCurrentTab') {
        if (request.nextScript && request.nextScript.length > 0) {
            request.action = request.nextScript
            injectTab(request, sender.tab?.id)
        }
    }
    if (request.action === 'inCurrentTabWithDelay') {
        setTimeout(() => {
            if (request.nextScript && request.nextScript.length > 0) {
                request.action = request.nextScript
                injectTab(request, sender.tab?.id)
            }
        }, request.delay)
    }
    if (request.action === 'openTefi') {
        openNewTab(`https://dgprc.atm-erp.com/dgprc/index.php?module=Fitac_fitac&offset=1&stamp=1687286622051739500&return_module=Fitac_fitac&action=DetailView&record=${request.content.fitacData.id}`, request)
    }
    if (request.action === "getOfficeFitac") {
        const statusId = request.content.fitacData.status_id
        const tipoExpediente = request.content.fitacData.tipo_expediente_c

        let idTemplate
        switch (statusId) {
            case 'aprobado':
            case 'desaprobado':
            case 'improcedente':
            case 'observado':
            case 'duplicada':
            case 'desestimiento':
                idTemplate = '174608db-a59e-9244-d652-67980a6448f6';
                break;
            case 'amerita_evap':
                idTemplate = '73107e4c-c398-bc4f-eac3-5dc5a402e07f';
                break;
            default:
                idTemplate = null;
        }

        if (tipoExpediente == "desestimiento") {
            idTemplate = '174608db-a59e-9244-d652-67980a6448f6';
        }

        if (idTemplate) {
            let blob;
            try {
                if (request.content.fitacData.id) {
                    blob = await TefiDB.getPDF(request.content.fitacData.id, idTemplate);
                }
            } catch (error) {
                console.error("Error al obtener el documento Fitac.", error);
            }
            if (blob) {
                const base64 = await blobToBase64(blob);
                if (!base64) {
                    console.error("Error al convertir el blob a base64.");
                    return;
                }
                request.content.docBase64 = base64.toString()
                request.action = "downloadFitacNew";
                request.content.fileName = `${request.content.fitacData.document_name}_OFICIO`;
                injectTab(request, sender.tab?.id);
            } else {
                console.error("No se pudo generar el blob para la conversión a base64.");
            }
        }
    }

    if (request.action === "getReportFitac") {
        const statusId = request.content.fitacData.status_id
        const tipoExpediente = request.content.fitacData.tipo_expediente_c
        let idTemplate
        switch (statusId) {
            case 'aprobado':
            case 'desaprobado':
            case 'observado':
            case 'duplicada':
            case 'desestimiento':
                idTemplate = 'b21dff8f-ca9c-833e-c896-67abc3e17777';
                break;
            case 'improcedente':
                idTemplate = 'cfa2eb2b-54d2-ba81-97cc-67be1370cc6d';
                break;
            case 'amerita_evap':
                idTemplate = '73107e4c-c398-bc4f-eac3-5dc5a402e07f';
                break;
            default:
                idTemplate = null;
        }

        if (tipoExpediente == "desestimiento") {
            idTemplate = '9a4f6d5a-51e6-4f11-06e1-67b511297224';
        }

        if (idTemplate && request.content.fitacData.id) {
            let blob;
            try {
                blob = await TefiDB.getPDF(request.content.fitacData.id, idTemplate);
            } catch (error) {
                console.error("Error al obtener el documento Fitac.", error);
            }
            if (blob) {
                const base64 = await blobToBase64(blob);
                if (!base64) {
                    console.error("Error al convertir el blob a base64.");
                    return;
                }

                request.content.docBase64 = base64.toString()
                request.action = "downloadFitacNew";
                request.content.fileName = `${request.content.fitacData.document_name}_INFORME`;
                injectTab(request, sender.tab?.id);
            } else {
                console.error("No se pudo generar el blob para la conversión a base64.");
            }
        }
    }

    return true;
}
)

chrome.runtime.onMessage.addListener(
    (request: IRequest, _sender, sendResponse) => {
        if (request.action === 'getRoadmapsGenerated') {
            getRoadMapsGeneratedInStorage(request.content.isOffice)
                .then((roadmaps) => {
                    sendResponse(roadmaps);
                })
                .catch(() => {
                    sendResponse([]);
                });
        }
        return true;
    }
);

function setInitialConfigInStorage() {
    const config = getConfigFromStorage()
    if (!config) {
        const request = createRequest()
        setConfigInStorage(request.config)
    }
}

function getConfigFromStorage(): Promise<IRequest["config"]> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response as IRequest["config"]);
            }
        });
    });
}

function setConfigInStorage(config: IRequest["config"]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(config, () => {
            if (chrome.runtime.lastError) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function setRoadmapGeneratedInStorage(roadmap: string, isOffice: boolean): Promise<boolean> {
    const roadmaps = await getRoadMapsGeneratedInStorage(isOffice);
    if (!roadmaps.includes(roadmap)) {
        roadmaps.push(roadmap);
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ ['roadmapGenerated' + (isOffice ? '_office' : '')]: roadmaps }, () => {
                if (chrome.runtime.lastError) {
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
    return Promise.resolve(true);
}

function getRoadMapsGeneratedInStorage(isOffice: boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('roadmapGenerated' + (isOffice ? '_office' : ''), (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response['roadmapGenerated' + (isOffice ? '_office' : '')] || []);
            }
        });
    });
}