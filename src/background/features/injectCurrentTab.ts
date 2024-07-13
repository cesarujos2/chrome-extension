export function injectCurrentTab(actions: { action: string, data?: any } = { action: '', data: {} }) {
    if(actions.action.length > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if(tabs.length > 0 && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, actions);
            }
        });
    }
}