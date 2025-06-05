export async function copyText(textToCopy: string) {
    try{
        await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
        console.error("Error copying text: ", error);
    }
}