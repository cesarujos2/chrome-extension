export class ModalOverlay {
  private static instance: ModalOverlay | null = null;
  private modalOverlay: HTMLDivElement | null = null;

  public static showModal(
    message: string, timeClose: number = 8000, callback?: () => void
  ): ModalOverlay {
    if (!ModalOverlay.instance) {
      ModalOverlay.instance = new ModalOverlay();
    }
    ModalOverlay.instance.createModal(message, timeClose, callback);
    return ModalOverlay.instance;
  }

  private createModal(
    message: string, timeClose: number = 8000, callback?: () => void
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
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1E1E2E'; // Color oscuro elegante
    modalContent.style.color = '#F8F8F2';
    modalContent.style.padding = '24px';
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

      button.onmouseover = () => {
        button.style.backgroundColor = '#4338CA';
      };

      button.onmouseout = () => {
        button.style.backgroundColor = '#4F46E5';
      };

      button.onmousedown = () => {
        button.style.transform = 'scale(0.95)';
      };

      button.onmouseup = () => {
        button.style.transform = 'scale(1)';
      };

      button.addEventListener('click', () => {
        this.closeModal();
        callback();
      });

      modalContent.appendChild(document.createElement('br'));
      modalContent.appendChild(button);
    }

    this.modalOverlay.appendChild(modalContent);
    document.body.appendChild(this.modalOverlay);

    // Cierra el modal si se hace clic fuera del contenido
    this.modalOverlay.addEventListener('click', (event) => {
      if (event.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    // Cierra el modal automáticamente tras cierto tiempo, si se especifica
    if (timeClose) {
      setTimeout(() => this.closeModal(), timeClose);
    }
  }

  public closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.remove();
      this.modalOverlay = null;
    }
  }
}
