import { IRequest } from "../../models/IRequest";

/**
 * Espera a que una pestaña específica (o la actual si no se indica) termine de cargar
 * completamente y luego le envía un mensaje (request).
 * 
 * @param tabId - El ID de la pestaña destino (o null para usar la pestaña activa)
 * @param request - El mensaje que se desea enviar a la pestaña
 */
export function waiting(request: IRequest, tabId?: number) {
    const waitAndSend = (targetTabId: number) => {
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
            if (updatedTabId === targetTabId && changeInfo.status === "complete") {
                chrome.tabs.sendMessage(targetTabId, request);
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    };

    if (tabId != null) {
        waitAndSend(tabId);
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0 && tabs[0].id !== undefined) {
                waitAndSend(tabs[0].id);
            }
        });
    }
}

