export function closeActiveTab() {
    setTimeout(() => {
        chrome.tabs.query({ active: true }, function (tabs) {
            if(tabs.length > 0 && tabs[0].id) {
                chrome.tabs.remove(tabs[0].id)
            }
        })
    }, 1000);
}