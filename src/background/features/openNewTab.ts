import { IRequest } from "../../models/IRequest";

export function openNewTab(url: string, request: IRequest) {
    chrome.tabs.create({ url: url }, function (tab) {
        if (request.action.length > 0) {
            chrome.tabs.onUpdated.addListener(
                function listener(tabId, changeInfo) {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        chrome.tabs.sendMessage(tabId, request);
                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                }
            )
        }
    })
}