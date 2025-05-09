import { createRequest } from "../utils/createRequestContent";
import { guardarEnLocalStorage, obtenerDeLocalStorage } from "./localStorageHandler";
import { ModalOverlay } from "./ModalOverlay";

export function addButtonFITAC() {
    if (!window.location.href.includes("dgprc.atm-erp.com/dgprc/index.php?module=Fitac_fitac")) return;

    const buttonsContainer = document.querySelectorAll(".buttons")[1];
    if (!buttonsContainer) return;

    const documentName = document.getElementById("document_name")?.textContent?.trim() ?? "";
    const statusId = (document.getElementById("status_id") as HTMLSelectElement)?.value?.trim() ?? "";
    const nroInforme = document.getElementById("nro_informe_rep_c")?.textContent?.trim() ?? "";
    const nroOficio = document.getElementById("nro_oficio_rep_c")?.textContent?.trim() ?? "";

    if (documentName === "") return;

    /**
     * Crea un botón con estilos y funcionalidad específica
     * @param text Texto del botón
     * @param isOffice Indica si es un oficio
     * @param storageKey Clave para almacenamiento local
     */
    const createButton = (text: string, isOffice: boolean, storageKey: string) => {
        const roadmapsGenerated = obtenerDeLocalStorage<string[]>(storageKey) ?? [];
        const isGenerated = roadmapsGenerated.includes(documentName);

        const button = document.createElement("button");
        Object.assign(button.style, {
            padding: "6px 12px",
            cursor: "pointer",
            border: "none",
            borderRadius: "8px",
            minWidth: "120px",
            textAlign: "center",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease, transform 0.1s ease",
            backgroundColor: isGenerated ? "#3f3f46" : "#F08377"
        });

        button.textContent = `Generar ${text}`;

        // Eventos de interacción
        button.onmouseover = () => button.style.filter = "brightness(90%)";
        button.onmouseout = () => button.style.filter = "brightness(100%)";
        button.onmousedown = () => button.style.transform = "scale(0.98)";
        button.onmouseup = () => button.style.transform = "scale(1)";

        button.onclick = (e: Event) => {
            e.preventDefault();
            ModalOverlay.showModal("Ejecutando...");

            // Enviar mensaje al background script
            const request = createRequest()
            request.action = "searchRoadMap"
            request.content.documents = [documentName];
            request.content.isOffice = isOffice;
            chrome.runtime.sendMessage(request);

            button.style.backgroundColor = "#3f3f46";
            guardarEnLocalStorage(storageKey, [...roadmapsGenerated, documentName]);
        };

        return button;
    };


    // Agregar botones si se cumplen las condiciones
    if (statusId !== "" && statusId !== "por_evaluar" && nroOficio == "" && nroInforme == "") {
        buttonsContainer.appendChild(createButton("Informe", false, "roadmapsInformeGenerated"));
    }
    if (nroInforme !== "" && nroOficio == "") {
        buttonsContainer.appendChild(createButton("Oficio", true, "roadmapsOfficeGenerated"));
    }
}