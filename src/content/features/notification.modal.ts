interface NotificationProps {
    type: 'success' | 'danger' | 'warning' | 'info'
    message: string
    duration?: number
    onClose?: () => void
}

class NotificationModal {
    private static instance: NotificationModal
    private container: HTMLDivElement

    private constructor() {
        this.container = document.createElement('div')
        this.container.style.cssText = `
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    `
        document.body.appendChild(this.container)
    }

    public static getInstance(): NotificationModal {
        if (!NotificationModal.instance) {
            NotificationModal.instance = new NotificationModal()
        }
        return NotificationModal.instance
    }

    public show({ type, message, duration = 4000, onClose }: NotificationProps): void {
        const toast = document.createElement('div')
        const icon = this.getIcon(type)
        
        toast.style.cssText = `
      min-width: 380px;
      max-width: 450px;
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.4;
      opacity: 0;
      transform: translateX(100%) scale(0.95);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      pointer-events: auto;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      position: relative;
      overflow: hidden;
      ${this.getTypeStyles(type)}
    `

        // Create icon element
        const iconElement = document.createElement('div')
        iconElement.style.cssText = `
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-top: 1px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
        iconElement.innerHTML = icon

        // Create message element
        const messageElement = document.createElement('div')
        messageElement.style.cssText = `
      flex: 1;
      word-wrap: break-word;
    `
        messageElement.textContent = message

        // Create close button
        const closeButton = document.createElement('div')
        closeButton.style.cssText = `
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    `
        closeButton.innerHTML = '✕'
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.opacity = '1'
        })
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.opacity = '0.7'
        })

        // Create progress bar
        const progressBar = document.createElement('div')
        progressBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
      width: 100%;
      transform-origin: left;
      animation: progress ${duration}ms linear;
    `

        // Add CSS animation for progress bar
        if (!document.getElementById('toast-progress-animation')) {
            const style = document.createElement('style')
            style.id = 'toast-progress-animation'
            style.textContent = `
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `
            document.head.appendChild(style)
        }

        toast.appendChild(iconElement)
        toast.appendChild(messageElement)
        toast.appendChild(closeButton)
        toast.appendChild(progressBar)
        this.container.appendChild(toast)

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1'
            toast.style.transform = 'translateX(0) scale(1)'
        })

        // Auto dismiss
        const timeoutId = setTimeout(() => {
            this.dismiss(toast, onClose)
        }, duration)

        // Click to dismiss
        const dismissHandler = () => {
            clearTimeout(timeoutId)
            this.dismiss(toast, onClose)
        }
        
        toast.addEventListener('click', dismissHandler)
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation()
            dismissHandler()
        })
    }

    private dismiss(toast: HTMLDivElement, onClose?: () => void): void {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(100%) scale(0.95)'
        toast.addEventListener('transitionend', () => {
            toast.remove()
            onClose?.()
        }, { once: true })
    }

    private getTypeStyles(type: NotificationProps['type']): string {
        const styles = {
            success: `
        background: linear-gradient(135deg, rgba(16, 150, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
        color: #ffffff;
      `,
            danger: `
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
        color: #ffffff;
      `,
            warning: `
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
        color: #ffffff;
      `,
            info: `
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%);
        color: #ffffff;
      `
        }
        return styles[type]
    }

    private getIcon(type: NotificationProps['type']): string {
        const icons = {
            success: '✓',
            danger: '✕',
            warning: '⚠',
            info: 'ℹ'
        }
        return icons[type]
    }
}

export const notify = {
    success(message: string, duration?: number) {
        NotificationModal.getInstance().show({ type: 'success', message, duration })
    },
    danger(message: string, duration?: number) {
        NotificationModal.getInstance().show({ type: 'danger', message, duration })
    },
    warning(message: string, duration?: number) {
        NotificationModal.getInstance().show({ type: 'warning', message, duration })
    },
    info(message: string, duration?: number) {
        NotificationModal.getInstance().show({ type: 'info', message, duration })
    }
}
