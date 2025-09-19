export class DervNotifier {
    private static readonly ICON = "icons/icon48.png";
    private static readonly TITLE = "Derivador encendido";
    private static readonly CONTEXT_MESSAGE = "Tómalo con calma, esto tomará su tiempo";

    /**
     * Crea una notificación de progreso en Chrome.
     *
     * @param id - ID opcional de la notificación. Si es null, se genera automáticamente.
     * @param progress - Valor entre 0 y 1 (será convertido a 0–100).
     * @param message - Mensaje que se mostrará en la notificación.
     * @returns Promise que resuelve con el ID de la notificación creada.
     */
    public static sendProgress(
        id: string | null,
        progress: number,
        message: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

            chrome.notifications.create(
                id ?? "",
                {
                    type: "progress",
                    iconUrl: this.ICON,
                    title: this.TITLE,
                    message,
                    contextMessage: this.CONTEXT_MESSAGE,
                    progress: Math.round(clampedProgress),
                    priority: 1,
                },
                (notificationId) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(notificationId);
                    }
                }
            );
        });
    }

    /**
     * Actualiza una notificación de progreso existente.
     *
     * @param notificationId - ID de la notificación a actualizar.
     * @param progress - Valor entre 0 y 1.
     * @param message - Mensaje actualizado.
     */
    public static updateProgress(
        notificationId: string,
        progress: number,
        message: string
    ): void {
        const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

        chrome.notifications.update(notificationId, {
            type: "progress",
            iconUrl: this.ICON,
            title: this.TITLE,
            message,
            progress: clampedProgress,
            priority: 1,
        });
    }

    /**
     * Elimina una notificación por su ID.
     *
     * @param notificationId - ID de la notificación a eliminar.
     */
    public static clear(notificationId: string): void {
        chrome.notifications.clear(notificationId);
    }
}
