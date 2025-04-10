export async function copyText(textToCopy: string) {
    await navigator.clipboard.writeText(textToCopy);
}