export async function delayScript(delay: number, callback: () => Promise<void> | void) {
    await new Promise(resolve => setTimeout(resolve, delay));
    await callback();
}