export async function whileAsync(
    condition: () => boolean | Promise<boolean>,
    action: () => void | Promise<void>,
    ifError?: (error: Error) => void,
    maxAttempts: number = 100,
    delayMs: number = 1000
): Promise<void> {
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        try {
            const shouldContinue = await condition();

            if (!shouldContinue) {
                return;
            }

            await action();
            await delay(delayMs);
        } catch (error) {
            ifError?.(error instanceof Error ? error : new Error(String(error)));
            return;
        }
    }

    ifError?.(new Error("Condition not met after maximum attempts"));
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}