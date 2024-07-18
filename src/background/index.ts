import { IFitac, Request } from "../interfaces/frontData"
import { TefiDB } from "../services/TefiDB"
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
        despachar: false
    }
}


chrome.runtime.onMessage.addListener(async function (request: Request) {
    if (request.action === 'searchRoadMap') {
        storeData.roadmap = request.data.roadmap
        if (!storeData.options.onlySearch) {
            const Tefi = new TefiDB()
            const data = await Tefi.getFitac(storeData.roadmap)
            storeData.data = data[0]
            
            chrome.runtime.sendMessage({ action: 'noResults', data: { finded: data.length == 0 } })
            if (data.length == 0) {
                return
            }
        } else{
            storeData.data.document_name = request.data.roadmap
            chrome.runtime.sendMessage({ action: 'noResults', data: { finded: false } })
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

}

)

export interface FrontData {
    roadmap: string;
    data: IFitac;
    options: {
        onlySearch: boolean;
        noDownload: boolean;
        despachar: boolean;
    }
}