import { Button, Checkbox, Input, Textarea } from "@nextui-org/react";
import { useState, useEffect, useRef } from "react";
import { createRequest } from "../utils/createRequestPopUp";
import useLocalStorage from "../hooks/use-localstorage";

function FormSeeker() {
    // Usamos solo este estado, que ya lee/escribe en localStorage
    const [isBulk, setIsBulk] = useLocalStorage<boolean>("isBulkStorage", true);

    const [textInput, setTextInput] = useState<string>("");
    const [bulkInput, setBulkInput] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const pattern = /^[IE]-\d{6}-\d{4}$/i;

    // Cambiar foco según isBulk
    useEffect(() => {
        if (isBulk) {
            textareaRef.current?.focus();
        } else {
            inputRef.current?.focus();
        }
    }, [isBulk]);

    // Toggle para el checkbox
    const toggleBulk = () => {
        setIsBulk((prev) => !prev);
    };

    const formatInput = (value: string) => {
        let val = value.trim().toUpperCase();

        if (val === "") return "";

        const letterMatch = val.match(/^[IE]/i);
        const numbers = letterMatch
            ? val.slice(1).replace(/\D/g, "")
            : val.replace(/\D/g, "");
        const letter = letterMatch ? letterMatch[0].toUpperCase() : "E";

        let formatted = letter;

        if (numbers.length > 0) {
            formatted += "-";
            formatted += numbers.substring(0, 6);
        }
        if (numbers.length > 6) {
            formatted += "-";
            formatted += numbers.substring(6, 10);
        }

        return formatted;
    };

    const handleInputChange = (val: string) => {
        const formatted = formatInput(val);
        setTextInput(formatted);
        if (error) setError(null);
    };

    const handleBulkChange = (val: string) => {
        setBulkInput(val);
        if (error) setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isBulk) {
            const lines = bulkInput
                .split("\n")
                .map((line) => formatInput(line))
                .filter((line) => line !== "");

            if (lines.length === 0) {
                setError("No hay hojas de ruta válidas.");
                return;
            }

            const invalids = lines.filter((line) => !pattern.test(line));
            if (invalids.length > 0) {
                setError(
                    `Entradas inválidas: ${invalids.join(", ")}. Corrija y vuelva a intentar.`
                );
                return;
            }

            setError(null);

            const request = createRequest();
            request.action = "searchRoadMap";
            request.content.documents = lines;
            request.content.isOffice = true;
            chrome.runtime.sendMessage(request);
        } else {
            if (!pattern.test(textInput)) {
                setError("Inválido!");
                return;
            }
            setError(null);

            const request = createRequest();
            request.action = "searchRoadMap";
            request.content.documents = [textInput];
            request.content.isOffice = true;
            chrome.runtime.sendMessage(request);
        }
    };

    return (
        <div className="px-4">
            <div className="mb-2 flex gap-1 justify-end">
                <Checkbox size="sm" isSelected={!!isBulk} onClick={toggleBulk}>
                    {isBulk ? "Masivo activado" : "Masivo desactivado"}
                </Checkbox>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {isBulk ? (
                    <Textarea
                        ref={textareaRef}
                        value={bulkInput}
                        onValueChange={handleBulkChange}
                        placeholder="Pega aquí las hojas de ruta, una por línea"
                        rows={8}
                        spellCheck={false}
                    />
                ) : (
                    <Input
                        ref={inputRef}
                        value={textInput}
                        onValueChange={handleInputChange}
                        placeholder="Hoja de ruta"
                        type="text"
                    />
                )}

                <Button type="submit">Enviar</Button>
            </form>

            {error && (
                <p className="text-red-700 text-center p-0.5 mt-2 font-semibold">{error}</p>
            )}
        </div>
    );
}

export default FormSeeker;
