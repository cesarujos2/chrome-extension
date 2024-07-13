export function injectForId(id: number, actions: { action: string, data?: any } = { action: '', data: {} }) {
    chrome.tabs.sendMessage(id, actions);
}