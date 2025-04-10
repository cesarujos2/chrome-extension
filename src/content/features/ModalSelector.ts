export class ModalSelector {
    private modalOverlay: HTMLDivElement | null = null;
    private modalContent: HTMLDivElement | null = null;
  
    constructor(private title: string, private actions: { label: string; onClick: () => void; }[]) {}
  
    public showModal() {
      if (this.modalOverlay) return; // Evita múltiples modales abiertos
  
      // Crear el overlay del modal
      this.modalOverlay = document.createElement('div');
      Object.assign(this.modalOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
        backdropFilter: 'blur(6px)'
      });
  
      // Crear el contenido del modal
      this.modalContent = document.createElement('div');
      Object.assign(this.modalContent.style, {
        backgroundColor: '#1E1E2E',
        color: '#F8F8F2',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '380px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: '0',
        transform: 'scale(0.9)',
        userSelect: 'none',
        fontFamily: 'Arial, sans-serif'
      });
  
      // Agregar título
      const titleElement = document.createElement('h2');
      titleElement.textContent = this.title;
      titleElement.style.marginBottom = '16px';
      this.modalContent.appendChild(titleElement);
  
      // Agregar botones de acción
      this.actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.label;
        Object.assign(button.style, {
          margin: '8px 0',
          padding: '10px 16px',
          backgroundColor: '#4F46E5',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%',
          transition: 'background-color 0.3s ease, transform 0.1s ease'
        });
  
        button.addEventListener('click', () => {
          action.onClick();
          this.closeModal();
        });
  
        this.modalContent?.appendChild(button);
      });
  
      // Agregar botón de cancelar
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancelar';
      Object.assign(cancelButton.style, {
        marginTop: '16px',
        padding: '10px 16px',
        backgroundColor: '#444',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        width: '100%',
        transition: 'background-color 0.3s ease, transform 0.1s ease'
      });
  
      cancelButton.addEventListener('click', () => this.closeModal());
      this.modalContent.appendChild(cancelButton);
  
      // Animación de aparición
      setTimeout(() => {
        this.modalContent!.style.opacity = '1';
        this.modalContent!.style.transform = 'scale(1)';
      }, 10);
  
      this.modalOverlay.appendChild(this.modalContent);
      document.body.appendChild(this.modalOverlay);
  
      // Cerrar modal al hacer clic fuera del contenido
      this.modalOverlay.addEventListener('click', (event) => {
        if (event.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }
  
    public closeModal() {
      if (this.modalOverlay) {
        this.modalOverlay.remove();
        this.modalOverlay = null;
        this.modalContent = null;
      }
    }
  }
  