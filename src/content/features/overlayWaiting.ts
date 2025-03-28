export class OverlayWaiting {
    private static overlayId = "overlay-waiting";

    public static show(message: string = "Espere, procesando...") {
        if (document.getElementById(this.overlayId)) return; // Evita duplicados

        const overlay = document.createElement("div");
        overlay.id = this.overlayId;
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'; // Color de fondo oscuro
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9998';
        overlay.style.backdropFilter = 'blur(0.5px)'; // Mayor desenfoque

        const messageBox = document.createElement("div");
        messageBox.style.backgroundColor = '#1E1E2E'; // Color oscuro elegante
        messageBox.style.color = '#F8F8F2';
        messageBox.style.padding = '24px';
        messageBox.style.borderRadius = '12px';
        messageBox.style.width = '90%';
        messageBox.style.maxWidth = '380px';
        messageBox.style.textAlign = 'center';
        messageBox.style.fontSize = '14px';
        messageBox.style.fontWeight = '600';
        messageBox.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.4)';
        messageBox.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        messageBox.style.opacity = '0';
        messageBox.style.transform = 'scale(0.9)';
        messageBox.style.cursor = 'pointer'; // Cambia el cursor al pasar por encima
        messageBox.style.userSelect = 'none'; // Evita la selección de texto
        messageBox.style.fontFamily = 'Arial, sans-serif'; // Fuente moderna
        messageBox.innerText = message;

        // Efecto hover (brillo NextUI)
        messageBox.addEventListener("mouseenter", () => {
            messageBox.style.boxShadow = "0px 4px 20px rgb(17, 17, 30)";
            messageBox.style.transform = "scale(1.05)";
        });
        messageBox.addEventListener("mouseleave", () => {
            messageBox.style.boxShadow = "0px 4px 20px rgba(30, 30, 46, 0.5)";
            messageBox.style.transform = "scale(1)";
        });

        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);

        // Hacer visible el mensaje después de la inserción
        setTimeout(() => {
            messageBox.style.opacity = "1";
            messageBox.style.transform = "scale(1)";
        }, 50);
    }

    public static hide() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.transform = "scale(0.9)";
            setTimeout(() => overlay.remove(), 300);
        }
    }
}
