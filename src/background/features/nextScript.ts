export function nextScript(actions: { action: string } = { action: '' }) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if(tabs.length > 0 && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, actions);
        }
    });
}