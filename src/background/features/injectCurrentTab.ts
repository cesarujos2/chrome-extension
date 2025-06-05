import { IRequest } from "../../models/IRequest";

export function injectTab(
    actions: IRequest,
    tabId?: number
) {
    if (actions.action.length > 0) {
        if (tabId !== undefined) {
            chrome.tabs.sendMessage(tabId, actions);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0 && tabs[0].id !== undefined) {
                    chrome.tabs.sendMessage(tabs[0].id, actions);
                }
            });
        }
    }
}
