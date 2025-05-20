export class ModalOverlay {
  private static instance: ModalOverlay | null = null;
  private modalOverlay: HTMLDivElement | null = null;

  public static showModal(
    message: string, callback?: () => void, callback2?: () => void
  ): ModalOverlay {
    if (!ModalOverlay.instance) {
      ModalOverlay.instance = new ModalOverlay();
    }
    ModalOverlay.instance.createModal(message, callback, callback2);
    return ModalOverlay.instance;
  }

  private createModal(
    message: string, callback?: () => void, callback2?: () => void
  ) {
    if (this.modalOverlay) return; // Evita múltiples modales abiertos

    // Creamos el overlay
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.style.position = 'fixed';
    this.modalOverlay.style.top = '0';
    this.modalOverlay.style.left = '0';
    this.modalOverlay.style.width = '100%';
    this.modalOverlay.style.height = '100%';
    this.modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.18)';
    this.modalOverlay.style.display = 'flex';
    this.modalOverlay.style.justifyContent = 'center';
    this.modalOverlay.style.alignItems = 'center';
    this.modalOverlay.style.zIndex = '9999';
    this.modalOverlay.style.backdropFilter = 'blur(8px)';

    // Creamos el contenido del modal
    const modalContent = document.createElement('form');
    modalContent.style.background = 'linear-gradient(135deg, #18181b 0%, #23272f 100%)';
    modalContent.style.color = '#ECEDEE';
    modalContent.style.padding = '36px 32px 28px 32px';
    modalContent.style.borderRadius = '18px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.textAlign = 'center';
    modalContent.style.fontSize = '15px';
    modalContent.style.fontWeight = '600';
    modalContent.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
    modalContent.style.transition = 'transform 0.3s cubic-bezier(.4,2,.6,1), opacity 0.3s';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.93)';
    modalContent.style.position = 'relative';
    modalContent.style.userSelect = 'none';
    modalContent.style.fontFamily = 'Inter, Arial, sans-serif';

    // Animación de aparición
    setTimeout(() => {
      modalContent.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    }, 10);

    // Mensaje
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.lineHeight = '1.5';
    modalContent.appendChild(messageDiv);

    // Contenedor de botones
    const buttonsContainer = document.createElement('div');

    if (callback || callback2) {
      buttonsContainer.style.marginTop = '18px';
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.justifyContent = 'center';
      buttonsContainer.style.gap = '16px';
      buttonsContainer.style.marginTop = '8px';
    }

    // Botón Derivar (callback2)
    if (callback2) {
      const button2 = document.createElement('button');
      button2.type = 'button';
      button2.textContent = 'Derivar';
      button2.style.padding = '10px 22px';
      button2.style.background = 'linear-gradient(90deg, #F871A0 0%, #FFB457 100%)';
      button2.style.color = '#fff';
      button2.style.border = 'none';
      button2.style.borderRadius = '8px';
      button2.style.cursor = 'pointer';
      button2.style.fontSize = '15px';
      button2.style.fontWeight = 'bold';
      button2.style.boxShadow = '0 2px 8px rgba(248,113,160,0.13)';
      button2.style.transition = 'background 0.2s, transform 0.1s';
      button2.onmouseover = () => { button2.style.background = 'linear-gradient(90deg, #F871A0 0%, #FF8C42 100%)'; };
      button2.onmouseout = () => { button2.style.background = 'linear-gradient(90deg, #F871A0 0%, #FFB457 100%)'; };
      button2.onmousedown = () => { button2.style.transform = 'scale(0.96)'; };
      button2.onmouseup = () => { button2.style.transform = 'scale(1)'; };
      button2.onfocus = () => { button2.style.outline = '2px solid #F871A0'; };

      button2.addEventListener('click', () => {
        this.closeModal();
        callback2();
      });

      buttonsContainer.appendChild(button2);
    }

    // Botón Cancelar (callback)
    if (callback) {
      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = 'Cancelar';
      button.style.padding = '10px 22px';
      button.style.background = 'linear-gradient(90deg, #6F6AFF 0%, #38BDF8 100%)';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '15px';
      button.style.fontWeight = 'bold';
      button.style.boxShadow = '0 2px 8px rgba(111,106,255,0.13)';
      button.style.transition = 'background 0.2s, transform 0.1s';
      button.onmouseover = () => { button.style.background = 'linear-gradient(90deg, #6366F1 0%, #0EA5E9 100%)'; };
      button.onmouseout = () => { button.style.background = 'linear-gradient(90deg, #6F6AFF 0%, #38BDF8 100%)'; };
      button.onmousedown = () => { button.style.transform = 'scale(0.96)'; };
      button.onmouseup = () => { button.style.transform = 'scale(1)'; };
      button.onfocus = () => { button.style.outline = '2px solid #6F6AFF'; };

      modalContent.addEventListener('submit', (e) => {
        e.preventDefault();
        this.closeModal();
        callback();
      });

      buttonsContainer.appendChild(button);

      setTimeout(() => {
        button.focus();
      }, 50);

      // Botón cerrar (esquina)
      const closeButton = document.createElement('button');
      closeButton.textContent = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.backgroundColor = 'rgba(36,37,46,0.7)';
      closeButton.style.border = 'none';
      closeButton.style.color = '#ECEDEE';
      closeButton.style.fontSize = '18px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.transition = 'all 0.2s';
      closeButton.style.fontWeight = 'bold';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '32px';
      closeButton.style.height = '32px';
      closeButton.style.display = 'flex';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      closeButton.onmouseover = () => { closeButton.style.backgroundColor = '#23272f'; };
      closeButton.onmouseout = () => { closeButton.style.backgroundColor = 'rgba(36,37,46,0.7)'; };
      closeButton.onclick = () => callback();
      modalContent.appendChild(closeButton);

      setTimeout(() => {
        this.closeModal();
        callback();
      }, 5000);
    } else {
      //Cierra el modal si se hace clic fuera del contenido
      this.modalOverlay.addEventListener('click', (event) => {
        if (event.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    // Añadir los botones al modal
    modalContent.appendChild(buttonsContainer);

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
