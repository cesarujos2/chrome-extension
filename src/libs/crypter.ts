class Crypter {
    private secretKey: Promise<CryptoKey>;

    constructor(secret: string) {
        this.secretKey = this.generateKey(secret);
    }

    private async generateKey(secret: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const encodedSecret = encoder.encode(secret);

        const hash = await crypto.subtle.digest("SHA-256", encodedSecret);

        return crypto.subtle.importKey(
            "raw",
            hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    public async encrypt(plainText: string): Promise<string> {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedText = encoder.encode(plainText);

        const key = await this.secretKey;

        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encodedText
        );

        return this.bufferToBase64(iv) + "." + this.bufferToBase64(new Uint8Array(encryptedData));
    }

    public async decrypt(encryptedText: string): Promise<string> {
        const [ivBase64, encryptedDataBase64] = encryptedText.split(".");
        const iv = this.base64ToBuffer(ivBase64);
        const encryptedData = this.base64ToBuffer(encryptedDataBase64);

        const key = await this.secretKey;

        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    }

    private bufferToBase64(buffer: Uint8Array): string {
        let binary = "";
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const len = binary.length;
        const buffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer;
    }
}


export const crypter = new Crypter(import.meta.env.VITE_SECRET_KEY)
