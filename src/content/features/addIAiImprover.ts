import { GeminiServiceFactory, IGeminiService } from '../services/Gemini';

// Global Gemini service instance
let geminiService: IGeminiService | null = null;

export function AddAiImprover() {
    if (!window.location.href.includes("dgprc.atm-erp.com/dgprc/index.php")) return;

    // Initialize Gemini service
    initializeGeminiService();

    // Inject modern CSS styles
    injectModernStyles();

    const textareas = document.querySelectorAll("textarea");

    textareas.forEach(textarea => {
        if (!textarea.id.includes('_c')) return;
        if(textarea.disabled) return;
        const parentNode = textarea.parentNode as HTMLElement;

        // Create wrapper div for positioning
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-improver-wrapper';
        parentNode.appendChild(wrapper);

        // Create the modern AI button
        const improveButton = createModernButton();

        // Add click handler
        improveButton.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            handleImproveText(textarea, improveButton);
        });
        ;
        wrapper.appendChild(improveButton);
    });
}

function injectModernStyles() {
    if (document.getElementById('ai-improver-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-improver-styles';
    style.textContent = `
        .ai-improver-wrapper {
            height: 100%;
            width: 90%;
            position: relative;
            display: block;
        }
        
        .ai-improve-btn {
            position: absolute;
            right: 8px;
            bottom: 8px;
            width: 32px;
            height: 32px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 1000;
        }
        
        .ai-improve-btn:hover {
            background: #e9ecef;
            border-color: #dee2e6;
            transform: translateY(-1px);
        }
        
        .ai-improve-btn:active {
            transform: translateY(0);
            background: #dee2e6;
        }
        
        .ai-improve-btn svg {
            width: 16px;
            height: 16px;
            color: #6c757d;
            transition: color 0.2s ease;
        }
        
        .ai-improve-btn:hover svg {
            color: #495057;
        }
        
        .ai-improve-btn.loading {
            background: #f8f9fa;
            border-color: #e9ecef;
            cursor: not-allowed;
        }
        
        .ai-improve-btn.loading svg {
            animation: spin 1s linear infinite;
            color: #adb5bd;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .ai-tooltip {
            position: absolute;
            bottom: 100%;
            right: 0;
            background: #212529;
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transform: translateY(4px);
            transition: all 0.2s ease;
            z-index: 1001;
            margin-bottom: 6px;
        }
        
        .ai-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            right: 8px;
            border: 4px solid transparent;
            border-top-color: #212529;
        }
        
        .ai-improve-btn:hover .ai-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
    `;

    document.head.appendChild(style);
}

function createModernButton() {
    const button = document.createElement('button');
    button.className = 'ai-improve-btn';

    // Modern AI/Sparkles icon
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5Z"/>
            <path d="M20 3v4"/>
            <path d="M22 5h-4"/>
            <path d="M4 17v2"/>
            <path d="M5 18H3"/>
        </svg>
        <div class="ai-tooltip">Mejorar con IA</div>
    `;

    return button;
}

async function initializeGeminiService() {
    try {
        // Get API key from chrome storage or environment
        const apiKey = await getApiKey();
        if (apiKey) {
            geminiService = GeminiServiceFactory.create(apiKey, import.meta.env.VITE_GEMINI_MODEL);
        }
    } catch (error) {
        console.error('Failed to initialize Gemini service:', error);
    }
}

function getApiKey(): Promise<string | null> {
    return import.meta.env.VITE_GEMINI_KEY;
}

async function handleImproveText(textarea: HTMLTextAreaElement, button: HTMLButtonElement) {
    const originalText = textarea.value.trim();

    if (!originalText) {
        showNotification('Por favor, escribe algo de texto para mejorar', 'warning');
        return;
    }

    if (!geminiService) {
        showNotification('Servicio de IA no disponible. Verifica la configuración.', 'error');
        return;
    }

    // Add loading state
    button.classList.add('loading');
    button.disabled = true;

    try {
        // Use Gemini service to improve text
        const improvedText = await geminiService.sendMessage(originalText);

        // Update textarea with improved text
        textarea.value = improvedText;

        // Show success notification
        showNotification('Texto mejorado con IA', 'success');

    } catch (error) {
        console.error('Error improving text:', error);
        showNotification('Error al mejorar el texto. Inténtalo de nuevo.', 'error');
    } finally {
        // Remove loading state
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showNotification(message: string, type: 'success' | 'warning' | 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d1e7dd' : type === 'warning' ? '#fff3cd' : '#f8d7da'};
        color: ${type === 'success' ? '#0f5132' : type === 'warning' ? '#664d03' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#badbcc' : type === 'warning' ? '#ffecb5' : '#f5c2c7'};
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    notification.textContent = message;

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}