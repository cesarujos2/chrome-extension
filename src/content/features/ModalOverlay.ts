import { createRequest } from "../utils/createRequestContent";

export class ModalOverlay {
  private static instance: ModalOverlay | null = null;
  private modalOverlay: HTMLDivElement | null = null;

  public static showModal(
    message: string, callback?: () => void
  ): ModalOverlay {
    if (!ModalOverlay.instance) {
      ModalOverlay.instance = new ModalOverlay();
    }
    ModalOverlay.instance.createModal(message, callback);
    return ModalOverlay.instance;
  }

  private createModal(
    message: string, callback?: () => void
  ) {
    if (this.modalOverlay) return; // Evita múltiples modales abiertos

    // Creamos el overlay
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.style.position = 'fixed';
    this.modalOverlay.style.top = '0';
    this.modalOverlay.style.left = '0';
    this.modalOverlay.style.width = '100%';
    this.modalOverlay.style.height = '100%';
    this.modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'; // Color
    this.modalOverlay.style.display = 'flex';
    this.modalOverlay.style.justifyContent = 'center';
    this.modalOverlay.style.alignItems = 'center';
    this.modalOverlay.style.zIndex = '9999';
    this.modalOverlay.style.backdropFilter = 'blur(6px)'; // Efecto de desenfoque

    // Creamos el contenido del modal
    const modalContent = document.createElement('form');
    modalContent.style.backgroundColor = '#1E1E2E'; // Color oscuro elegante
    modalContent.style.color = '#F8F8F2';
    modalContent.style.padding = '32px';
    modalContent.style.borderRadius = '12px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '380px';
    modalContent.style.textAlign = 'center';
    modalContent.style.fontSize = '14px';
    modalContent.style.fontWeight = '600';
    modalContent.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.4)';
    modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.cursor = 'pointer'; // Cambia el cursor al pasar por encima
    modalContent.style.userSelect = 'none'; // Evita la selección de texto
    modalContent.style.fontFamily = 'Arial, sans-serif'; // Fuente moderna

    // Animación de aparición
    setTimeout(() => {
      modalContent.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    }, 10);

    modalContent.textContent = message;

    // Si se proporciona callback, se agrega un botón para aceptarlo
    if (callback) {
      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = 'Aceptar';
      button.style.marginTop = '16px';
      button.style.padding = '10px 16px';
      button.style.backgroundColor = '#4F46E5';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '14px';
      button.style.fontWeight = 'bold';
      button.style.transition = 'background-color 0.3s ease, transform 0.1s ease';
      button.onmouseover = () => { button.style.backgroundColor = '#4338CA'; };
      button.onmouseout = () => { button.style.backgroundColor = '#4F46E5'; };
      button.onmousedown = () => { button.style.transform = 'scale(0.95)'; };
      button.onmouseup = () => { button.style.transform = 'scale(1)'; };
      button.onfocus = () => { button.style.outline = 'none'; };

      modalContent.addEventListener('submit', (e) => {
        e.preventDefault();
        this.closeModal();
        callback();
      });

      modalContent.appendChild(document.createElement('br'));
      modalContent.appendChild(button);

      setTimeout(() => {
        button.focus();
      }, 50);

      //Crear boton para cerrar el modal
      const closeButton = document.createElement('button');
      closeButton.textContent = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '8px';
      closeButton.style.right = '8px';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.color = '#F8F8F2';
      closeButton.style.fontSize = '16px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.transition = 'all 0.3s ease';
      closeButton.style.fontWeight = 'bold';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '32px';
      closeButton.onclick = () => this.closeModal();
      closeButton.onmouseover = () => { closeButton.style.rotate = '90deg'; };
      closeButton.onmouseout = () => { closeButton.style.rotate = '0deg'; };

      modalContent.appendChild(closeButton);

      setTimeout(() => {
        const request = createRequest()
        request.action = "inCurrentTab"
        request.nextScript = "checkIsMasivo"
        chrome.runtime.sendMessage(request);
      }, 8000)

    } else {
      //Cierra el modal si se hace clic fuera del contenido
      this.modalOverlay.addEventListener('click', (event) => {
        if (event.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    this.modalOverlay.appendChild(modalContent);
    document.body.appendChild(this.modalOverlay);

  }

  public closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.remove();
      this.modalOverlay = null;
    }
  }
}
