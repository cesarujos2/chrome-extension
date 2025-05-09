export async function findElementWithRetry(
  query: string, // Selector: #id, .clase, tag, etc.
  maxRetries: number = 1000, // Número máximo de intentos
  interval: number = 1000 // Intervalo entre intentos en milisegundos
): Promise<HTMLElement | null> {
  let attempts = 0;

  while (attempts < maxRetries) {
    const element = document.querySelector(query) as HTMLElement | null;
    if (element && getComputedStyle(element).display !== "none") {
      return element;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return null;
}

export async function findElementsWithRetry(
  callbackSearch: () => HTMLElement | HTMLElement[] | null,
  maxRetries: number = 100,
  interval: number = 1000,
): Promise<HTMLElement | null | HTMLElement[]> {
  let attempts = 0;
  while (attempts < maxRetries) {
    const elements = callbackSearch();
    if (elements && (!Array.isArray(elements) || elements.some(el => getComputedStyle(el).display !== "none"))
    ) {
      return elements;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return null;
}
