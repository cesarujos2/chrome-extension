export function openNewTab(url: string, actions: { action: string } = { action: '' }) {
    console.log('openNewTab')
    chrome.tabs.create({ url: url }, function (tab) {
        if (actions.action.length > 0) {
            chrome.tabs.onUpdated.addListener(
                function listener(tabId, changeInfo) {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        chrome.tabs.sendMessage(tabId, actions);
                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                }
            )
        }
    })
}