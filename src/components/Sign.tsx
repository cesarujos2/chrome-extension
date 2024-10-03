import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";

function Sign() {
    const [certificate, setCertificate] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [fileName, setFileName] = useState<string | null>(null); // Para mostrar el nombre del archivo

    useEffect(() => {
        const storedCertificate = localStorage.getItem("certificate");
        const storedPassword = localStorage.getItem("password");

        if (storedCertificate) {
            setCertificate(storedCertificate);
            setFileName("Certificado cargado previamente"); 
        }
        if (storedPassword) {
            setPassword(storedPassword);
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result instanceof ArrayBuffer) {
                    const base64Data = btoa(
                        String.fromCharCode(...new Uint8Array(e.target.result))
                    );
                    setCertificate(base64Data);
                    setFileName(file.name); // Establece el nombre del archivo
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleSave = () => {
        if (certificate && password) {
            localStorage.setItem("certificate", certificate);
            localStorage.setItem("password", password);

            chrome.runtime.sendMessage({ action: "saveCertificate", data: {
                password: password,
                certificate: certificate
            } });
        }
    };

    return (
        <div>
            <h1 className="font-bold text-lg text-center">Firma Electrónica</h1>
            <div className="px-6 grid gap-3">
            {fileName && (
                <p className="text-sm text-blue-500 mt-2">Archivo: {fileName}</p>
            )}
                <div>
                    <input
                        type="file"
                        accept=".pfx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600 cursor-pointer border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <Input
                        size="sm"
                        type="password"
                        label="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
}

export default Sign;
