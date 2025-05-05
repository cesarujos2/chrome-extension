export function blobToBase64(blob: Blob): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(null);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
