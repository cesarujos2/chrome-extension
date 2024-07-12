import { FrontData } from "../interfaces/frontData"
import { openNewTab } from "./features/openNewTab"

const frontData: FrontData = {
    roadmap: ''
}


chrome.runtime.onMessage.addListener(function (request) {
    if (request.action === 'runScript') {
        frontData.roadmap = request.roadmap
        openNewTab('https://wwww.example.com')
    }
}
)