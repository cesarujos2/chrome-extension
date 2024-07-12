import { FrontData, Request } from "../interfaces/frontData"
import { queryTefiDB } from "../services/TefiDB"
// import { openNewTab } from "./features/openNewTab"

const frontData: FrontData = {
    roadmap: ''
}


chrome.runtime.onMessage.addListener(async function (request: Request) {
    if (request.action === 'searchInTefi') {
        frontData.roadmap = request.data.roadmap
        const data = await queryTefiDB(`SELECT * FROM iga_igas WHERE iga_igas.name = '${frontData.roadmap}'`)
        if(data.length == 0) {
            chrome.runtime.sendMessage({ action: 'noResults' })
        }
        console.log(data)
    }
}
)