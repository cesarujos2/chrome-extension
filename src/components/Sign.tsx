import { Input } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { crypter } from '../libs/crypter'

function Sign() {
    const [certificate, setCertificate] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageSave, setMessageSave] = useState<string | null>(null);

    useEffect(() => {
        const loadStoredData = async () => {
            const storedCertificate = localStorage.getItem("certificate");
            const storedPassword = localStorage.getItem("password");
    
            if (storedCertificate) {
                setCertificate(storedCertificate);
                setMessage("Certificado cargado previamente!");
            }
            if (storedPassword) {
                // Llamada asíncrona al método decrypt
                const decryptedPassword = await crypter.decrypt(storedPassword);
                setPassword(decryptedPassword);
            }
        };
    
        loadStoredData();
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
                    setMessage("Se ha cargado el archivo " + file.name);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleMessageSave = (message: string) => {
        setMessageSave(message);
        setTimeout(() => {
            setMessageSave(null);
        }, 2000)
    }

    const handleSave = async () => {
        if (certificate && password) {
            const encryptedPassword = await crypter.encrypt(password);
    
            localStorage.setItem("certificate", certificate);
            localStorage.setItem("password", encryptedPassword);
    
            chrome.runtime.sendMessage({
                action: "saveCertificate",
                data: {
                    password: password,
                    certificate: certificate
                }
            });
    
            handleMessageSave("Credenciales guardadas!");
        } else { 
            handleMessageSave("Todos los campos son requeridos!");
        }
    };    

    return (
        <div>
            <h1 className="font-bold text-lg text-center pb-2">Firma Electrónica</h1>
            <div className="px-6 grid gap-3">
            {message && (
                <p className="text-sm text-blue-500 mt-2 text-center">Mensaje: {message}</p>
            )}
                <div>
                    <label htmlFor="inputCertificate" className="block pb-1">Certificado</label>
                    <input
                        type="file"
                        accept=".pfx"
                        id="inputCertificate"
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
                        variant="bordered"
                        labelPlacement="outside"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    style={{ fontSize: "14px"}}
                >
                    Guardar certificado
                </button>
            </div>
            <div className="py-3">
                {messageSave && (
                    <div className="text-sm text-red-500 mt-2 text-center">{messageSave}</div>
                )}
            </div>
        </div>
    );
}

export default Sign;
