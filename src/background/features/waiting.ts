export function waiting(actions: { action: string } = { action: '' }) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tabs[0].id && changeInfo.status === "complete") {
                chrome.tabs.sendMessage(tabs[0].id, actions);
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    });
}