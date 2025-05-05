import { IRequest } from "../../models/IRequest";

export function injectForId(id: number, request: IRequest) {
    chrome.tabs.sendMessage(id, request);
}