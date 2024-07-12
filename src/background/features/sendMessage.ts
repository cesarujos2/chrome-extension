export function sendMessage(actions: { action: string, data?: any } = { action: '', data: {} }) {
    if(actions.action.length > 0) {
        chrome.runtime.sendMessage(actions)
    }
}