export const getRowUO = async (inputUO: HTMLInputElement, tableUO: HTMLTableElement, value: string, intentos: number = 0): Promise<HTMLTableRowElement> => {
    if (intentos > 10) throw new Error("No se encontró la UO destino después de varios intentos.");

    inputUO.value = value;
    inputUO.dispatchEvent(new Event('keyup', {
        bubbles: true,
        cancelable: true,
    }));

    let rowUO = tableUO.children[1].children[0] as HTMLTableRowElement
    if (rowUO?.children[2]?.textContent?.trim() == value) return rowUO as HTMLTableRowElement;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getRowUO(inputUO, tableUO, value, intentos + 1));
        }, 1000);
    })
}