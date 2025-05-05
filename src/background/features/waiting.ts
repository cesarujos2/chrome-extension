import { IRequest } from "../../models/IRequest";

export function waiting(request: IRequest) {
    if(request.action.length > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tabs[0].id && changeInfo.status === "complete") {
                    chrome.tabs.sendMessage(tabs[0].id, request);
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });
        });
    }
}